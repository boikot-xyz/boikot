import React from "react";


const initialState = {
    comment: "",
    sources: {},
};

function tojson(state) {
    return JSON.stringify(state, null, 2);
}

export function Jsoner() {
    const [state, setState] = React.useState(initialState);

    const setComment = e =>
        setState( oldState => (
            { ...oldState, comment: e.target.value }
        ));

    return <div>
        <textarea value={state.comment} onChange={setComment} />
        <pre>{tojson(state)}</pre>
    </div>;
}

