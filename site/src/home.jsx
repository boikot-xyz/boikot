import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Companies } from "./companies.jsx";
import { Centerer, Header, Stack, WrappingPre } from "./components.jsx";
import boikot from "../../boikot.json";

export function Home() {
    return <Centerer>
        <Header />
        <Jsoner/>
        <Companies/>
        <WrappingPre>
            { JSON.stringify(boikot, null, 4) }
        </WrappingPre>
    </Centerer>
}

