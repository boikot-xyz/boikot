import React from "react";
import styled from "styled-components";

import { Jsoner } from "./jsoner.jsx";
import { Centerer, Header, Stack, WrappingPre } from "./components.jsx";
import boikot from "../../boikot.json";

export function Home() {
    return <Centerer>
        <Header />
        <Jsoner/>
    </Centerer>
}

