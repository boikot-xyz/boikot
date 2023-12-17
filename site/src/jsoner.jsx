import React from "react";
import styled from "styled-components";

import { Stack, WrappingPre, copy } from "./components.jsx";

if( !crypto.randomUUID ) crypto.randomUUID = () => "";

window.addEventListener('beforeunload', e => {
    e.preventDefault();
    e.returnValue = '';
});

const initialState = {
    names: [],
    comment: "",
    sources: {},
    tags: [],
    score: "",
    ownedBy: "",
    logoUrl: "",
    siteUrl: "",
    updatedAt: (new Date()).toISOString(),
    jsondump: "",
};

function tojson(state) {
    const result = { ...state, score: parseFloat(state.score) };
    delete result.jsondump;
    return `"${crypto.randomUUID()}":` +
        JSON.stringify(result, null, 4) + ",";
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

function generatePrompt(info) {
    return info;
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

const Entry = styled.label`
    display: grid;
    gap: .6rem;
    grid-template-columns: max-content auto;
    align-items: center;
    * {
        padding: 0.2rem 0.4rem;
    }
`;

const ifCtrlC = f => e =>
    (e.ctrlKey || e.metaKey) && e.key == "c" && f();

export function Jsoner() {
    const [state, setState] = React.useState(initialState);
    const showSources = !!Object.keys(state.sources).length;

    const setNames = e =>
        setState( oldState => ({
            ...oldState,
            names: e.target.value.split(", "),
        }) );

    const setComment = e =>
        setState( oldState => (
            {
                ...oldState,
                comment: e.target.value,
                sources: makeSources(e.target.value, oldState.sources),
            }
        ));

    const setSource = key => e =>
        setState( oldState => ({
            ...oldState,
            sources: {
                ...oldState.sources,
                [key]: e.target.value,
            },
        }) );

    const setTags = e =>
        setState( oldState => ({
            ...oldState,
            tags: e.target.value.split(", "),
        }) );

    const setStateField = fieldName => e =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: e.target.value,
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
        <h2> Add a New Company </h2>
        <Entry>
            names + ticker
            <input
                value={state.names.join(", ")}
                onChange={setNames} />
        </Entry>
        <h3> comment </h3>
        <textarea
            style={{ height: "15rem", padding: "0.2rem 0.4rem" }}
            value={state.comment}
            onChange={setComment}
            onPaste={handlePaste(setState)} />
        { state.comment && <button onClick={() =>
            copy(generatePrompt(state.comment))}>
            copy summarise prompt 📋
        </button> }
        { showSources && <h3> sources </h3> }
        { Object.keys(state.sources).map(key =>
            <Entry key={key}>
                {key}
                <input
                    value={state.sources[key]}
                    onChange={setSource(key)} />
            </Entry>
        )}
        { showSources &&
            <button onClick={sortSources(setState)}>
                sort sources 🃏
            </button> }
        <div/>
        <Entry>
            tags
            <input
                value={state.tags.join(", ")}
                onChange={setTags} />
        </Entry>
        <Entry>
            score
            <input
                value={state.score}
                onChange={setStateField("score")} />
        </Entry>
        <Entry>
            logoUrl
            <input
                value={state.logoUrl}
                onChange={setStateField("logoUrl")} />
        </Entry>
        <Entry>
            siteUrl
            <input
                value={state.siteUrl}
                onChange={setStateField("siteUrl")} />
        </Entry>
        <Entry>
            ownedBy
            <input
                value={state.ownedBy}
                onChange={setStateField("ownedBy")} />
        </Entry>
        <h3> jsondump </h3>
        <textarea
            style={{ height: "4rem", padding: "0.2rem 0.4rem" }}
            value={state.jsondump}
            onChange={setStateField("jsondump")} />
        <button onClick={mergeJSONDump}>
            merge 🖇️
        </button>
        <WrappingPre>
            {tojson(state)}
        </WrappingPre>
        <button onClick={() => copy(tojson(state))}>
            copy company data 📋
        </button>
        <button onClick={() => window.location.reload()}>
            clear 🧽
        </button>
    </Stack>;
}

