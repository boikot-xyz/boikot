import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Blog } from "./blog/blog.jsx";
import { Companies } from "./companies.jsx";
import { Centerer, Stack, WrappingPre } from "./components.jsx";
import boikot from "../../boikot.json";

export function Home() {
    return <Centerer>
        <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>
        <Jsoner/>
        <Companies/>
        <Blog />
        <WrappingPre>
            { JSON.stringify(boikot, null, 4) }
        </WrappingPre>
    </Centerer>
}

