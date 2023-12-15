import React from "react";
import styled from "styled-components";

import blog1 from "./1.txt";

const blogs = [
    blog1,
];

export function Blog() {
    return <div>
        <h1> blog </h1>
        { blogs.map( blog =>
            <pre>{ blog }</pre> ) }
    </div>;
}
