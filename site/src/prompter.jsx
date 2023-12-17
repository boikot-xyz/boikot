import React from "react";
import styled from "styled-components";

import { Stack, copy } from "./components.jsx";


function generatePrompt(info) {
    return info;
}

export function Prompter() {
    const [ info, setInfo ] = React.useState("");

    return <Stack style={{ marginBottom: "3rem" }}>
        <h2> infodump </h2>
        <textarea
            style={{ height: "12rem", padding: "0.2rem 0.4rem" }}
            value={info}
            onChange={ e => setInfo(e.target.value) } />
        { info && <h2> prompt 💬 </h2> }
        <p style={{ maxHeight: "10rem", overflow: "scroll" }}>
            { generatePrompt(info) }
        </p>
        <button onClick={() => copy(generatePrompt(info))}>
            copy prompt 📋
        </button>
    </Stack>;
}

