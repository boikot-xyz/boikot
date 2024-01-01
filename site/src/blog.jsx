import React from "react";
import styled from "styled-components";
import { useLoaderData } from "react-router-dom";

import { Centerer, Header, Stack, WrappingPre } from "./components.jsx";

const blogFiles = [
    "4.md",
    "3.md",
    "2.md",
    "1.md",
];

export async function loadBlogs() {
    const blogs = await Promise.all(
        blogFiles.map( async file =>
            (await fetch(`/blogs/${file}`)).text()
        )
    );
    return blogs;
}

export function Blogs() {
    const blogs = useLoaderData();
    return <Centerer>
        <Header />
        <Stack>
            <h1> blog </h1>
            { blogs.map( blog =>
                <WrappingPre key={blog.slice(0,10)}>
                    { blog }
                </WrappingPre> ) }
        </Stack>
    </Centerer>;
}

