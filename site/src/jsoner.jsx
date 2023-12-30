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
    gap: .3rem;
    * {
        padding: 0.6rem;
        font-size: .9rem;
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
        <h1> Company Editor </h1>
        <Entry>
            names & stock ticker
            <input
                value={state.names.join(", ")}
                placeholder="Type names and press enter after each"
                onChange={setStateList("names")} />
        </Entry>
        <Entry>
            tags
            <input
                value={state.tags.join(", ")}
                placeholder="Type tags that describe this company and press enter after each"
                onChange={setStateList("tags")} />
        </Entry>
        <Entry>
            owned by
            <input
                value={state.ownedBy.join(", ")}
                placeholder="codes of the companies that own this one"
                onChange={setStateList("ownedBy")} />
        </Entry>
        <Entry>
            site URL
            <input
                value={state.siteUrl}
                placeholder="link to the company's website"
                onChange={setStateField("siteUrl")} />
        </Entry>
        <Entry>
            logo URL
            <input
                value={state.logoUrl}
                placeholder="URL of the company's logo"
                onChange={setStateField("logoUrl")} />
        </Entry>
        <Entry>
            comment
            <textarea
                style={{ height: "15rem" }}
                placeholder="Enter a short summary of this company's most and least ethical actions. References can be placed by numbers in square brackets eg. [1], [2]"
                value={state.comment}
                onChange={setComment}
                onPaste={handlePaste(setState)} />
        </Entry>
        { state.comment && <PillButton onClick={() =>
            copy(generatePrompt(state.comment, state.names[0]))}>
            copy summarise prompt 📋
        </PillButton> }
        { showSources && <>
            <h3> sources </h3>
            { Object.keys(state.sources).map(key =>
                <Entry key={key}>
                    {key}
                    <input
                        value={state.sources[key]}
                        placeholder={`Paste the link for source [${key}] here`}
                        onChange={setSource(key)} />
                </Entry>
            )}
            <PillButton onClick={sortSources(setState)}>
                sort sources 🃏
            </PillButton>
        </>}
        <Entry>
            ethical score
            <input
                value={state.score}
                placeholder="Enter a score from 0 to 100"
                onChange={setStateField("score")} />
        </Entry>
        <PillButton onClick={() => copy(tojson(state))}>
            copy company data 📋
        </PillButton>
        <PillButton onClick={() => window.location.reload()}>
            clear 🧽
        </PillButton>
        <WrappingPre>
            {tojson(state)}
        </WrappingPre>
    </Stack>;
}

export function CompanyEditor() {
    return <Centerer>
        <Header />
        <Jsoner />
    </Centerer>;
}

