import React from "react";
import styled, { css } from "styled-components";

export const Stack = styled.div`
    display: grid;
    gap: 1rem;
    ${ props => css`gap: ${props.gap}` }
`;

export const Row = styled.div`
    display: grid;
    gap: 1rem;
    align-items: center;
    grid-auto-flow: column;
    width: max-content;
    ${ props => css`gap: ${props.gap}` }
`;

export const WrappingPre = styled.pre`
    white-space: pre-wrap;
    word-wrap: anywhere;
`;

const CentererOuter = styled.div`
    display: grid;
    place-items: center;
    width: 100vw;
`;

const IconInner = styled.img`
`;
export const Icon = props =>
    <IconInner
        src={require(`./icons/${props.i}.svg`)}
        {...props} />

export const Centerer = ({ children }) =>
    <CentererOuter>
        <Stack style={{ padding: "2rem", maxWidth: "50rem" }}>
            { children }
        </Stack>
    </CentererOuter>;

export const Header = () =>
    <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>;

export const copy = text =>
    navigator.clipboard.writeText(text);

