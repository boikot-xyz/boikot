import React from "react";
import styled from "styled-components";
import slugify from "slugify";

import boikot from '../../boikot.json';
import { Centerer, Header, PillButton, Stack, WrappingPre, copy } from "./components.jsx";

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
        "practices of different companies:";
    const comments =
        Object.values(boikot).map( entry => entry.comment );
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

    const setStateField = fieldName => e =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: e.target.value,
        }) );

    const setStateList = fieldName => e =>
        setState( oldState => ({
            ...oldState,
            [fieldName]: e.target.value.split(", "),
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
        <h2> Company Editor </h2>
        <Entry>
            names + ticker
            <input
                value={state.names.join(", ")}
                onChange={setStateList("names")} />
        </Entry>
        <h3> comment </h3>
        <textarea
            style={{ height: "15rem", padding: "0.2rem 0.4rem" }}
            value={state.comment}
            onChange={setComment}
            onPaste={handlePaste(setState)} />
        { state.comment && <PillButton onClick={() =>
            copy(generatePrompt(state.comment, state.names[0]))}>
            copy summarise prompt 📋
        </PillButton> }
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
            <PillButton onClick={sortSources(setState)}>
                sort sources 🃏
            </PillButton> }
        <div/>
        <Entry>
            tags
            <input
                value={state.tags.join(", ")}
                onChange={setStateList("tags")} />
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
                value={state.ownedBy.join(", ")}
                onChange={setStateList("ownedBy")} />
        </Entry>
        <h3> jsondump </h3>
        <textarea
            style={{ height: "4rem", padding: "0.2rem 0.4rem" }}
            value={state.jsondump}
            onChange={setStateField("jsondump")} />
        <PillButton onClick={mergeJSONDump}>
            merge 🖇️
        </PillButton>
        <WrappingPre>
            {tojson(state)}
        </WrappingPre>
        <PillButton onClick={() => copy(tojson(state))}>
            copy company data 📋
        </PillButton>
        <PillButton onClick={() => window.location.reload()}>
            clear 🧽
        </PillButton>
    </Stack>;
}

export function CompanyEditor() {
    return <Centerer>
        <Header />
        <Jsoner />
    </Centerer>;
}

