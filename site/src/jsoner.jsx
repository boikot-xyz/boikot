import React from "react";
import styled, { css } from "styled-components";
import slugify from "slugify";
import { useParams } from "react-router";
import "whatwg-fetch";
import { Helmet } from "react-helmet";

import boikot from '../../boikot.json';
import { CodeBlock, copy, DeleteableBadgeList, FlexRow, Icon, Page, PillButton, Stack } from "./components.jsx";

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

function JsonDump({ value, mergeJSON }) {
    const [ dumping, setDumping ] = React.useState(false);
    const [ json, setJson ] = React.useState("");
    const clear = () => setJson("") + setDumping(false);
    return <Stack>
        { dumping && <Entry>
            jsondump
            <textarea
                placeholder={
                    "Paste JSON data here and click \"merge\" " +
                    "to merge it into the company data entry. " +
                    "Only use this if you know what it will do!"
                }
                style={{ height: "15rem" }}
                value={json}
                onChange={ e => setJson(e.target.value) } />
        </Entry> }
        <PillButton $outline style={{ justifySelf: "right" }}
            onClick={
                !dumping
                ? setDumping
                : () => mergeJSON(json) && clear()
            }>
            { dumping ? "merge 🖇️" : "merge JSON 🖇️" }
        </PillButton>
    </Stack>
}


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


    const mergeJSON = json => {
        try {
            const newObj = JSON.parse(json);
            setState( oldState => ({
                ...oldState,
                ...newObj,
            }) );
            return true;
        } catch(error) {
            alert("Could not parse JSON 😩");
        }
    };

    return <Stack onKeyDown={ifCtrlC( () => copy(tojson(state)) )}>
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
                <Entry key={key} $valid={!!state.sources[key]}>
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
            <CodeBlock style={{ maxHeight: "10rem", overflow: "scroll" }}>
                {tojson(state)}
            </CodeBlock>
        </Entry>
        <FlexRow style={{ justifyContent: "right" }}>
            <PillButton $outline onClick={
                () => window.confirm("Clear company data?")
                    && setState(initialState)
            }>
                clear 🧽
            </PillButton>
            <PillButton onClick={() => copy(tojson(state))}>
                copy company data 📋
            </PillButton>
        </FlexRow>
        <JsonDump mergeJSON={mergeJSON} />
        <CompleteButton state={state} mergeJSON={mergeJSON} />
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

