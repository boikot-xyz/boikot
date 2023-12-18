import React from "react";
import styled from "styled-components";

export const Stack = styled.div`
    display: grid;
    gap: 1rem;
`;

export const Row = styled.div`
    display: grid;
    gap: 1rem;
    align-items: center;
    grid-auto-flow: column;
    width: max-content;
`;

export const WrappingPre = styled.pre`
    white-space: pre-wrap;
    word-wrap: anywhere;
`;

export const copy = text =>
    navigator.clipboard.writeText(text);

