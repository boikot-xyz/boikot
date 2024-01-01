import React from "react";
import styled, { css } from "styled-components";
import slugify from "slugify";

import boikot from '../../boikot.json';
import { Centerer, DeleteableBadgeList, FlexRow, Header, Icon, PillButton, Stack, CodeBlock, copy } from "./components.jsx";

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
    jsondump: "",
};

function tojson(state) {
    const result = {
        ...state,
        ownedBy: state.ownedBy || null,
        score: parseFloat(state.score),
    };
    delete result.jsondump;
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
        padding: 0.6rem;
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


export function Jsoner() {
    const [state, setState] = React.useState(initialState);
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


    const mergeJSONDump = () => {
        try {
            const newObj = JSON.parse(state.jsondump);
            setState( oldState => ({
                ...oldState,
                ...newObj,
                jsondump: ""
            }) );
        } catch(error) {
            alert("Could not parse JSON 😩");
        }
    };

    return <Stack onKeyDown={ifCtrlC( () => copy(tojson(state)) )}>
        <h1> Company Editor </h1>
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
            <PillButton
                $outline
                style={{ justifySelf: "right" }}
                onClick={sortSources(setState)}>
                sort sources 🃏
            </PillButton>
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
            <PillButton $outline onClick={() => window.location.reload()}>
                clear 🧽
            </PillButton>
            <PillButton onClick={() => copy(tojson(state))}>
                copy company data 📋
            </PillButton>
        </FlexRow>
    </Stack>;
}

export function CompanyEditor() {
    return <Centerer>
        <Header />
        <Jsoner />
        <p> To submit a company record, please fill out the form
            above and copy-paste the company data into a new Issue on
            our <a href="https://github.com/boikot-xyz/boikot/issues"
                target="_blank" rel="noreferrer"> github repo. </a>
        </p>
    </Centerer>;
}

