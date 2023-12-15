import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Blog } from "./blog/blog.jsx";
import { Stack, WrappingPre } from "./components.jsx";
import boikot from "../../boikot.json";

const Centerer = styled.div`
    display: grid;
    place-items: center;
    width: 100vw;
`;

export function Home() {
    return <Centerer>
        <Stack style={{ padding: "2rem", maxWidth: "50rem" }}>
            <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>
            <Jsoner/>
            <Blog />
            <WrappingPre>
                { JSON.stringify(boikot, null, 2) }
            </WrappingPre>
        </Stack>
    </Centerer>
}

