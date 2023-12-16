import React from "react";
import styled from "styled-components";

import { Stack } from "./components.jsx";


const copyPrompt = info => () => {
    navigator.clipboard.writeText(info);
};

export function Prompter() {
    const [ info, setInfo ] = React.useState("");

    return <Stack style={{ marginBottom: "3rem" }}>
        <h2> infodump </h2>
        <textarea
            style={{ height: "12rem", padding: "0.2rem 0.4rem" }}
            value={info}
            onChange={ e => setInfo(e.target.value) } />
        <button onClick={copyPrompt(info)}> copy prompt 💬 </button>
    </Stack>;
}

