import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

export const PillButton = styled.button`
    background: var(--fg);
    color: var(--bg);
    border-radius: 0.75rem;
    padding: 0.25rem;
`;

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
    height: 2rem;
    ${ props => css`height: ${props.height}` }
`;
export const Icon = props =>
    <IconInner
        src={`/icons/${props.i}.svg`}
        {...props} />

export const Centerer = ({ children, style }) =>
    <CentererOuter style={style}>
        <Stack style={{
            padding: "2rem", maxWidth: "50rem", width: "100%"
        }}>
            { children }
        </Stack>
    </CentererOuter>;

export const Header = () =>
    <Row style={{
        width: "100%",
        gridTemplateColumns: "max-content auto",
        justifyItems: "right",
    }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: "white" }}> boikot 🙅‍♀️ </h1>
        </Link>
        <MenuButton />
    </Row>;

const ScreenFiller = styled.div`
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
`;

function Menu({ open, close }) {
    if( !open ) return null;

    return <ScreenFiller style={{
        backdropFilter: "blur(.4rem)",
        WebkitBackdropFilter: "blur(.4rem)",
        background: "var(--bg-transparent)",
    }}>
        <Centerer>
            <Row style={{
                width: "100%",
                gridTemplateColumns: "auto min-content"
            }}>
                <h1> menu 🗺️</h1>
                <IconButton i="x" onClick={close} />
            </Row>
            <Link to="/"> home </Link>
            <Link to="/companies"> companies </Link>
            <Link to="/blog"> blog </Link>
            <VersionNumber />
        </Centerer>
    </ScreenFiller>;
}

export function IconButton( props ) {
    return <button onClick={ props.onClick }>
        <Icon {...{...props, onClick: undefined}} />
    </button>;
}

export function MenuButton() {
    const [ open, setOpen ] = React.useState(false);

    return <>
        <IconButton onClick={ () => setOpen(true) } i="menu" />
        <Menu open={open} close={ () => setOpen(false) } />
    </>;
}

export const VersionNumber = () =>
    <span> boikot.xyz @ { process.env.VERSION } </span>;

export const copy = text =>
    navigator.clipboard.writeText(text);

