import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Blog } from "./blog/blog.jsx";
import boikot from "../../boikot.json";

export const Stack = styled.div`
    display: grid;
    gap: 1rem;
`;


export function Home() {
    return <Stack style={{ padding: "2rem", maxWidth: "50rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>
        <Jsoner/>
        <Blog />
        <pre style={{ whiteSpace: "pre-wrap" }}>
            { JSON.stringify(boikot, null, 2) }
        </pre>
    </Stack>;
}

