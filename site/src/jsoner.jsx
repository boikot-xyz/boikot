import React from "react";
import styled from "styled-components";

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
    ownedBy: null,
};

function tojson(state) {
    const result = { ...state, score: parseFloat(state.score) };
    return `"${crypto.randomUUID()}":` +
        JSON.stringify(result, null, 2) + ",";
}

function makeSources(comment, oldSources) {
    const matches = comment.match(/\[(\d+)\]/g) ?? [];
    const keys = matches.map( m => m.match(/\d+/)[0] );
    return keys.reduce( (res,key) =>
        ({...res, [key]: oldSources[key] ?? ""}), {} );
}

const sortSources = setState => () => setState( state => {
    const matches = state.comment.match(/\[(\d+)\]/g) ?? [];
    const keys = matches.map( m => +m.match(/\d+/)[0] );

    if( (new Set(keys)).size !== keys.length ) {
        alert("duplicate source numbers detected!");
        return state;
    }

    const newKeyMap = keys.reduce( (res,key,i) => ({
        ...res,
        [key]: i+1,
    }), {} );

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

const Inputs = styled.div`
    display: grid;
    gap: 1rem;
`;

const Entry = styled.label`
    display: grid;
    gap: .6rem;
    grid-template-columns: min-content auto;
`;

const ifCtrlC = f => e =>
    (e.ctrlKey || e.metaKey) && e.key == "c" && f();

const copy = text =>
    navigator.clipboard.writeText(text);

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

    const setScore = e =>
        setState( oldState => ({
            ...oldState,
            score: e.target.value,
        }) );

    return <Inputs onKeyDown={ifCtrlC( () => copy(tojson(state)) )}>
        <Entry>
            names
            <input
                value={state.names.join(", ")}
                onChange={setNames} />
        </Entry>
        <h2> comment </h2>
        <textarea
            style={{ height: "8rem" }}
            value={state.comment}
            onChange={setComment} />
        { showSources && <h2> sources </h2> }
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
                sort sources
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
                onChange={setScore} />
        </Entry>
        <pre style={{whiteSpace: "pre-wrap", wordWrap: "anywhere"}}>
            {tojson(state)}
        </pre>
        <button onClick={() => copy(tojson(state))}>
            copy
        </button>
    </Inputs>;
}

