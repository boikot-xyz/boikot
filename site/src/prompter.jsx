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
            onPaste={ handlePaste(setState) } />
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

