import React from "react";


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

    return <div>
        <textarea value={state.comment} onChange={setComment} />
        { Object.keys(state.sources).map(key =>
            <label>
                {key}
                <input value={state.sources[key]} />
            </label>
        )}
        <pre>{tojson(state)}</pre>
    </div>;
}

