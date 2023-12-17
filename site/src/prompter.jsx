import React from "react";
import styled from "styled-components";

import { Stack, copy } from "./components.jsx";


const initialState = {
    infodump: "",
    sources: {},
};

function generatePrompt(info) {
    return info;
}

const handlePaste = setInfo => e => {
    e.preventDefault();

    const pasteStart = e.target.selectionStart;
    const pasteEnd = e.target.selectionEnd;
    const pasteContent = e.clipboardData.getData('text/html');

    setInfo( info =>
        info.slice(0, pasteStart) +
        pasteContent +
        info.slice(pasteEnd)
    );
};

export function Prompter() {
    const [ state, setState ] = React.useState(initialState);

    const setInfo = newInfodump => setState( oldState =>
        ({ ...oldState, infodump: newInfodump }) );

    return <Stack style={{ marginBottom: "3rem" }}>
        <h2> infodump </h2>
        <textarea
            style={{ height: "15rem", padding: "0.2rem 0.4rem" }}
            value={state.infodump}
            onChange={ e => setInfo(e.target.value) }
            onPaste={ handlePaste(setInfo) } />
        { state.infodump && <h2> prompt 💬 </h2> }
        <p style={{ maxHeight: "10rem", overflow: "scroll" }}>
            { generatePrompt(state.infodump) }
        </p>
        <button onClick={() =>
            copy(generatePrompt(state.infodump))}>
            copy prompt 📋
        </button>
    </Stack>;
}

