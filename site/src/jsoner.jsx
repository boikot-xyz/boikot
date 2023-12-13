import React from "react";
import styled from "styled-components";


const initialState = {
    comment: "",
    sources: {},
};

function tojson(state) {
    return JSON.stringify(state, null, 2);
}

function makeSources(comment, oldSources) {
    const matches = comment.match(/\[(\d+)\]/g) ?? [];
    const keys = matches.map( m => m.match(/\d+/)[0] );
    return keys.reduce( (res,key) =>
        ({...res, [key]: oldSources[key] ?? ""}), {} );
}

const Inputs = styled.div`
    display: grid;
`;

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


    return <Inputs>
        <h4> comment </h4>
        <textarea value={state.comment} onChange={setComment} />
        <h4> sources </h4>
        { Object.keys(state.sources).map(key =>
            <label>
                {key}
                <input
                    value={state.sources[key]}
                    onChange={setSource(key)} />
            </label>
        )}
        <pre>{tojson(state)}</pre>
    </Inputs>;
}

