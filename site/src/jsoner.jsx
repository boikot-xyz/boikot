import React from "react";
import styled, { css } from "styled-components";
import slugify from "slugify";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import "whatwg-fetch";
import { Helmet } from "react-helmet";

import boikot from '../../boikot.json';
import { CodeBlock, copy, DeleteableBadgeList, FlexRow, Icon, Page, PillButton, Stack, Row } from "./components.jsx";
import { Company } from "./companies.jsx";

const initialState = {
    names: [],
    comment: "",
    sources: {},
    tags: [],
    score: "",
    ownedBy: [],
    logoUrl: "",
    siteUrl: "",
    updatedAt: (new Date()).toISOString(),
};

const getInitialState = key => {
    const keyCompanyData = boikot.companies[key] || initialState;
    return { ...initialState, ...keyCompanyData };
};

function tojson(state) {
    const result = {
        ...state,
        ownedBy: state.ownedBy || null,
        score: parseFloat(state.score),
    };
    return `"${slugify(state.names[0] || "").toLowerCase()}": ` +
        `${JSON.stringify(result, null, 4)},`;
}

function makeSources(comment, oldSources) {
    const matches = comment.match(/\[(\d+)\]/g) ?? [];
    const keys = [
        ...Object.keys(oldSources),
        ...matches.map( m => m.match(/\d+/)[0] )
    ];
    return keys.reduce( (res,key) =>
        ({...res, [key]: oldSources[key] ?? ""}), {} );
}

const sortSources = setState => () => setState( state => {
    const matches = state.comment.match(/\[(\d+)\]/g) ?? [];
    const keys = matches.map( m => +m.match(/\d+/)[0] );

    const newKeyMap = {};
    for( const key of keys ) {
        if( !newKeyMap[key] )
            newKeyMap[key] = Object.keys(newKeyMap).length + 1;
    }

    const newSources = {};
    let newComment = state.comment;
    for( const key of keys ) {
        newComment = newComment.replace(
            `[${key}]`, `[%${newKeyMap[key]}]`
        );
        newSources[newKeyMap[key]] = state.sources[key];
    }
    for( const key of keys ) {
        newComment = newComment.replace(
            `[%${newKeyMap[key]}]`, `[${newKeyMap[key]}]`
        );
    }

    return { ...state, comment: newComment, sources: newSources };
});

function generatePrompt( info, name ) {
    const preamble =
        "* Here are some summaries of the ethical and unethical " +
        "practices of different companies:\n\n";
    const comments =
        Object.values(boikot.companies)
            .filter( entry => !!entry.comment )
            .slice(0, 3)
            .map( entry => entry.comment );
    const nameOrThisCompany = name || "this company";
    const request =
        "\n\n* Please create a summary like those above for " +
        nameOrThisCompany +
        " based on the information below. Please make sure you only " +
        "write two sentences.\n\n";
    const ending =
        "\n\n* Please respond with your two-sentence summary of the " +
        `ethical and unethical practices of ${nameOrThisCompany}.`;

    return preamble + comments.join("\n\n") + request + info + ending;
}

const getRefKey = ref =>
    ref.innerHTML.match(/\d+/)[0];

const handlePaste = setState => e => {
    const pasteHTML = e.clipboardData.getData('text/html');
    const dummyP = document.createElement("p");
    dummyP.innerHTML = pasteHTML;

    const refs = [ ...dummyP.querySelectorAll(
        "sup.reference a"
    ) ];

    const refMap = refs.reduce( (res,ref) => ({
        ...res,
        [ getRefKey(ref) ]: ref.href,
    }), {} );

    console.log(refMap);
};

const Entry = styled.div`
    display: grid;
    gap: .5rem;
    input, textarea {
        font-size: .9rem;
        ${ props => css`border-color: ${
            props.$valid && "var(--success)"
        }` }
    }
    ${ props => css`color: ${props.$valid && "var(--success)"}` }
`;

const ifCtrlC = f => e =>
    (e.ctrlKey || e.metaKey) && e.key == "c" && f();

const ifEnter = f => e =>
    e.key == "Enter" && f(e);

const lastKey = obj =>
    Object.keys(obj)[Object.keys(obj).length - 1];

const nextKey = obj =>
    parseFloat(lastKey(obj) ?? 0) + 1

const insertIntoString = ( originalString, insertIndex, insertionString ) =>
    originalString.slice(0, insertIndex) +
    insertionString +
    originalString.slice(insertIndex);


async function complete( state, mergeJSON ) {
    const response = await fetch(
        "http://localhost:8014/complete", {
            method: 'POST',
            body: JSON.stringify(state),
        } );
    const {
        siteUrl, logoUrl, tickers, commentPrompt
    } = await response.json();
    const names = [...state.names, ...tickers];
    mergeJSON(JSON.stringify({
        names, siteUrl, logoUrl
    }));
    copy(commentPrompt);
    alert("copied prompt!");
}

function mergeArrays( array1, array2 ) {
    return [ ...(array1 || []), ...(array2 || []) ];
}

function mergeSources( sources1, sources2 ) {
    const maxSource1 = Math.max(0, ...Object.keys(sources1 || {}));
    const adjustedSources2 = Object.fromEntries(
        Object.entries(sources2 || {}).map(([k, v]) => [+k + maxSource1, v])
    );
    return { ...(sources1 || {}), ...adjustedSources2 };
}

function mergeJSON( existingCompanyData, newData ) {
    return {
        ...existingCompanyData,
        ...newData,
        names: mergeArrays( existingCompanyData?.names, newData?.names ),
        tags: mergeArrays( existingCompanyData?.tags, newData?.tags ),
        sources: mergeSources( existingCompanyData?.sources, newData?.sources ),
    };
}


function CompleteButton({ state, mergeJSON}) {
    const [ show, setShow ] = React.useState(false);
    React.useEffect( () => {
        fetch("http://localhost:8014/check")
            .then(response => response.json())
            .then(({ result }) => setShow(result))
            .catch(() => {});
    }, [] );

    if( !show ) return null;

    return <PillButton $outline style={{ justifySelf: "right" }}
        onClick={ () => complete(state, mergeJSON) }>
        complete ✨
    </PillButton>;
}

const searchEcosia = searchQuery => `https://www.ecosia.org/search?q=${encodeURIComponent(searchQuery)}`;
const makeWikipediaSearchURL = companyName => searchEcosia(companyName + " wikipedia");
const makeUnethicalSearchURL = companyName => searchEcosia(companyName + " unethical");
const makeScandalSearchURL = companyName => searchEcosia(companyName + " scandal");
const makeGoogleSearchURL = companyName => `https://www.google.com/search?q=${encodeURIComponent(companyName)}%20unethical`;
const makeCompanyReportSearchURL = companyName => searchEcosia(companyName + " company report");
const makeViolationTrackerSearchURL = companyName => `https://violationtracker.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`
const makeViolationTrackerUKSearchURL = companyName => `https://violationtrackeruk.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`
const makeViolationTrackerGlobalSearchURL = companyName => `https://violationtrackerglobal.goodjobsfirst.org/?company_op=starts&company=${encodeURIComponent(companyName)}`
const makeBlueskySearchURL = companyName => `https://bsky.app/search?q=${encodeURIComponent(companyName)}%20unethical`
const makeEthicaldotorgSearchURL = companyName => `https://ethical.org.au/search?q=${encodeURIComponent(companyName)}`

function SearchLinks({ state }) {
    if( !state.names?.length ) return null;

    const searchUrls = [
        [ "📑 search for wikipedia page", makeWikipediaSearchURL(state.names[0]) ],
        [ "👺 search for unethical practices", makeUnethicalSearchURL(state.names[0]) ],
        [ "😮 search for scandals", makeScandalSearchURL(state.names[0]) ],
        [ "🔎 search google", makeGoogleSearchURL(state.names[0]) ],
        [ "🧑‍💼 search for company report", makeCompanyReportSearchURL(state.names[0]) ],
        [ "📈 search violation tracker", makeViolationTrackerSearchURL(state.names[0]) ],
        [ "📉 search violation tracker uk", makeViolationTrackerUKSearchURL(state.names[0]) ],
        [ "🌍 search violation tracker global", makeViolationTrackerGlobalSearchURL(state.names[0]) ],
        [ "🦋 search bluesky", makeBlueskySearchURL(state.names[0]) ],
        [ "✅ search ethical.org", makeEthicaldotorgSearchURL(state.names[0]) ],
    ];

    const openAll = () => searchUrls.forEach( ([ _, url ]) => window.open(url) );

    return <FlexRow style={{ justifyContent: "right" }}>
        { searchUrls.map(([ label, url ]) =>
            <Link to={url} target="_blank" key={label}>
                <PillButton $outline $small>
                    { label }
                </PillButton> 
            </Link>
        ) }
        <PillButton onClick={openAll} $small>
            📚 open all
        </PillButton> 
    </FlexRow>;
}


export function Jsoner() {
    const { key } = useParams();
    const [state, setState] = React.useState(getInitialState(key));
    const textareaRef = React.useRef(null);
    const showSources = !!Object.keys(state.sources).length;

    const setComment = e =>
        setState( oldState => (
            {
                ...oldState,
                comment: e.target.value,
                sources: makeSources(e.target.value, oldState.sources),
            }
        ));

    const addSource = () =>
        setState( oldState => ({
            ...oldState,
            comment: insertIntoString(
                oldState.comment,
                textareaRef.current.selectionEnd,
                `[${nextKey(oldState.sources)}]`,
            ),
            sources: {
                ...oldState.sources,
                [nextKey(oldState.sources)]: "",
            },
        }) );

    const setSource = key => e =>
        setState( oldState => ({
            ...oldState,
            sources: {
                ...oldState.sources,
                [key]: e.target.value,
            },
        }) );

    const setStateField = fieldName => e =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: e.target.value,
        }) );

    const addToStateList = fieldName => e =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: [...oldState[fieldName], e.target.value],
        }) );

    const removeFromStateList = fieldName => i =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: oldState[fieldName].filter( (_,j) => j != i ),
        }) );

    const onMergeJSONClick = json => {
        try {
            const newData = JSON.parse(json);
            setState( oldState => mergeJSON( oldState, newData ) );
        } catch(error) {
            alert("Could not parse JSON 😩");
        }
    };

    const actionButtons = 
        <FlexRow style={{ justifyContent: "right" }}>
            <PillButton
                $outline
                onClick={ async () => onMergeJSONClick(await navigator.clipboard.readText()) }
                title="Click to paste json from clipboard and merge it with the company data">
                merge JSON 🖇️
            </PillButton>
            <PillButton $outline onClick={
                () => window.confirm("Clear company data?")
                    && setState(initialState)
            }>
                clear 🧽
            </PillButton>
            <PillButton onClick={() => copy(tojson(state))}>
                copy company data 📋
            </PillButton>
        </FlexRow>;

    return <Stack onKeyDown={ifCtrlC( () => copy(tojson(state)) )}>
        { actionButtons }
        <Entry $valid={state.names.length > 0}>
            names & stock ticker
            <DeleteableBadgeList
                items={state.names}
                deleteAtIndex={removeFromStateList("names")} />
            <input
                placeholder="Type names and press enter after each"
                onKeyDown={ifEnter(addToStateList("names"))}
                onKeyUp={ifEnter(e => e.target.value = "")} />
        </Entry>
        <SearchLinks state={state} />
        <Entry $valid={state.tags.length > 0}>
            tags
            <DeleteableBadgeList
                items={state.tags}
                deleteAtIndex={removeFromStateList("tags")} />
            <input
                placeholder="Type tags that describe this company and press enter after each"
                onKeyDown={ifEnter(addToStateList("tags"))}
                onKeyUp={ifEnter(e => e.target.value = "")} />
        </Entry>
        <Entry $valid={state.ownedBy.length > 0}>
            owned by
            <DeleteableBadgeList
                items={state.ownedBy}
                deleteAtIndex={removeFromStateList("ownedBy")} />
            <input
                placeholder="codes of the companies that own this one"
                onKeyDown={ifEnter(addToStateList("ownedBy"))}
                onKeyUp={ifEnter(e => e.target.value = "")} />
        </Entry>
        <Entry $valid={!!state.siteUrl}>
            site URL
            <input
                value={state.siteUrl}
                placeholder="link to the company's website"
                onChange={setStateField("siteUrl")} />
        </Entry>
        <Entry $valid={!!state.logoUrl}>
            logo URL
            <input
                value={state.logoUrl}
                placeholder="URL of the company's logo"
                onChange={setStateField("logoUrl")} />
        </Entry>
        <Entry $valid={!!state.comment}>
            comment
            <textarea
                style={{ height: "15rem" }}
                placeholder="Enter a short summary of this company's most and least ethical actions. References can be placed by numbers in square brackets eg. [1], [2]"
                value={state.comment}
                ref={textareaRef}
                onChange={setComment}
                onPaste={handlePaste(setState)} />
        </Entry>
        <FlexRow style={{ justifyContent: "right" }}>
            { state.comment && <PillButton
                $outline
                onClick={() => copy(
                    generatePrompt(state.comment, state.names[0])
                )}>
                copy summarise prompt 📋
            </PillButton> }
            <PillButton $outline onClick={addSource}>
                add source 🔗
            </PillButton>
            { showSources &&
                <PillButton
                    $outline
                    style={{ justifySelf: "right" }}
                    onClick={sortSources(setState)}>
                    sort sources 🃏
                </PillButton> }
        </FlexRow>
        { showSources && <>
            <h3> sources </h3>
            { Object.keys(state.sources).map(key =>
                <Entry key={key} $valid={!!state.sources[key]} style={{ display: "grid", gridTemplateColumns: "1.32rem 1fr", alignItems: "center" }}>
                    {key}
                    <input
                        value={state.sources[key]}
                        placeholder={`Paste the link for source [${key}] here`}
                        onChange={setSource(key)} />
                </Entry>
            )}
        </>}
        <Entry $valid={parseFloat(state.score) <= 100}>
            ethical score
            <input
                value={state.score}
                placeholder="Enter a score from 0 to 100"
                onChange={setStateField("score")} />
        </Entry>
        <Entry>
            output company data
            <CodeBlock style={{ maxHeight: "10rem", overflowY: "scroll" }}>
                {tojson(state)}
            </CodeBlock>
        </Entry>
        { actionButtons }
        <CompleteButton state={state} mergeJSON={mergeJSON} />
        { !!state?.names?.length && <>
            <h2> Preview: </h2>
            <div style={{ border: "0.05rem solid var(--fg)", borderRadius: "2rem", background: "var(--fg-transparent)", padding: "2rem" }}>
                <Company entry={state} />
            </div>
        </> }
    </Stack>;
}

export function CompanyEditor() {
    return <Page>
        <Helmet>
            <title> Company Editor | boikot </title>
            <meta name="description" content="boikot is a community-led initiative to collect and make available data on the unethical actions of big companies. On this page you can edit the details of a company to submit it to our database." />
        </Helmet>
        <Stack>
            <h1> Company Editor </h1>
            <p> To submit a company record, please fill out the form
                below and copy-paste the company data into a <a
                    href="https://github.com/boikot-xyz/boikot/issues"
                    target="_blank" rel="noreferrer">
                    new Issue on our github repo
                </a> or email it to <a
                    href="mailto:submissions@boikot.xyz">
                    submissions@boikot.xyz </a>.
                We will then add it to our database 🤝 please cite
                your sources!
            </p>
            <Jsoner />
        </Stack>
    </Page>;
}

