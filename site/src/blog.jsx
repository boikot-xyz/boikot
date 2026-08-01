import React from "react";
import styled from "styled-components";
import { useLoaderData } from "react-router-dom";

import { Stack, Page, WrappingPre } from "./components.jsx";

const blogFiles = [
    "amazon.md",
    "adidas.md",
    "6.md",
    "5.md",
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

function BlogHeader({ blog }) {
    const title = blog.match(/# (.+)/)?.[1];
    const author = blog.match(/## Author: (.+)/)?.[1];
    const date = blog.match(/## Date: (.+)/)?.[1];
    const text = blog.match(/\n\n(.+)/ms)?.[1].trim();
    const converter = new showdown.Converter();
    const html = converter.makeHtml(text);

    return <Stack gap="0.5rem">
        <h2> {title} </h2>
        <h4> {date} </h4>
        <h4> by {author} </h4>
        <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{__html: html}} />
    </Stack>;
}

export function Blogs() {
    const blogs = useLoaderData();
    return <Page>
        <Stack>
            <h1> blog </h1>
            <p> Welcome to the boikot blog! We post here about companies, ethics
                and the development of the website. </p>
            { blogs.map( blog =>
                <>
                    <hr />
                    <BlogHeader blog={blog} />
                </>
            ) }
        </Stack>
    </Page>;
}

