import React from "react";


const initialState = {
    comment: "",
    sources: {},
};

function tojson(state) {
    return JSON.stringify(state, null, 2);
}

function makeSources(comment, oldSources) {
    const nSources = comment.match(/\[a-z\]/g).length;
    return {
        "1": nSources,
    };
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
        <pre>{tojson(state)}</pre>
    </div>;
}

