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
    justify-items: stretch;
    width: 100vw;
`;

const IconInner = styled.img`
    height: 2rem;
    ${ props => css`height: ${props.height}` }
`;
export const Icon = props =>
    <IconInner
        src={`/icons/${props.i}.svg`}
        {...props} />

export const Centerer = ({ children, style }) =>
    <CentererOuter style={style}>
        <Stack style={{ padding: "2rem", maxWidth: "50rem" }}>
            { children }
        </Stack>
    </CentererOuter>;

export const Header = () =>
    <Row style={{
        width: "100%",
        gridTemplateColumns: "auto min-content"
    }}>
        <h1> boikot 🙅‍♀️ </h1>
        <Icon i="menu" />
    </Row>;

export const Footer = () =>
    <div>
        boikot.xyz @ { process.env.VERSION }
    </div>;

export const copy = text =>
    navigator.clipboard.writeText(text);

