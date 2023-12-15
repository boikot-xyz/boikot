import React from "react";
import styled from "styled-components";

import { Stack, WrappingPre } from "../components.jsx";

import blog1 from "./1.txt";

const blogs = [
    blog1,
];

export function Blog() {
    return <Stack>
        <h1> blog </h1>
        { blogs.map( blog =>
            <WrappingPre>{ blog }</WrappingPre> ) }
    </Stack>;
}
