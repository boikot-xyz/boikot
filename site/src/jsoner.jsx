import React from "react";
import styled from "styled-components";


const initialState = {
    comment: "",
    sources: {},
    tags: [],
    score: "",
    ownedBy: null,
};

function tojson(state) {
    const result = { ...state, score: parseFloat(state.score) };
    return JSON.stringify(result, null, 2) + ",";
}

function makeSources(comment, oldSources) {
    const matches = comment.match(/\[(\d+)\]/g) ?? [];
    const keys = matches.map( m => m.match(/\d+/)[0] );
    return keys.reduce( (res,key) =>
        ({...res, [key]: oldSources[key] ?? ""}), {} );
}

const Inputs = styled.div`
    display: grid;
    gap: 1rem;
`;

const ifCtrlC = f => e =>
    (e.ctrlKey || e.metaKey) && e.key == "c" && f();

const copy = text =>
    navigator.clipboard.writeText(text);

export function Jsoner() {
    const [state, setState] = React.useState(initialState);

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
            tags: e.target.value.split(" "),
        }) );

    const setScore = e =>
        setState( oldState => ({
            ...oldState,
            score: e.target.value,
        }) );


    return <Inputs onKeyDown={ifCtrlC( () => copy(tojson(state)) )}>
        <h2> comment </h2>
        <textarea value={state.comment} onChange={setComment} />
        <h2> sources </h2>
        { Object.keys(state.sources).map(key =>
            <label key={key}>
                {key}
                <input
                    value={state.sources[key]}
                    onChange={setSource(key)} />
            </label>
        )}
        <label>
            tags
            <input
                value={state.tags.join(" ")}
                onChange={setTags} />
        </label>
        <label>
            score
            <input
                value={state.score}
                onChange={setScore} />
        </label>
        <pre style={{maxWidth: "100vw"}}>{tojson(state)}</pre>
        <button onClick={() => copy(tojson(state))}>
            copy
        </button>
        <button onClick={() => setState(initialState)}>
            clear
        </button>
    </Inputs>;
}

