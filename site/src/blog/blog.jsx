import React from "react";
import styled from "styled-components";

import { Stack, WrappingPre } from "../components.jsx";

import blog1 from "./1.txt";
import blog2 from "./2.txt";
import blog3 from "./3.txt";

const blogs = [
    blog3,
    blog2,
    blog1,
];

export function Blog() {
    return <Stack>
        <h1> blog </h1>
        { blogs.map( blog =>
            <WrappingPre key={blog.slice(0,10)}>
                { blog }
            </WrappingPre> ) }
    </Stack>;
}
