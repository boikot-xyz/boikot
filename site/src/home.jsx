import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Blog } from "./blog/blog.jsx";
import { Stack } from "./components.jsx";
import boikot from "../../boikot.json";


export function Home() {
    return <Stack style={{ padding: "2rem", maxWidth: "50rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>
        <Jsoner/>
        <Blog />
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "anywhere" }}>
            { JSON.stringify(boikot, null, 2) }
        </pre>
    </Stack>;
}

