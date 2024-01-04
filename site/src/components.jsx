import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

export const PillButton = styled.button`
    background: var(--fg);
    color: var(--bg);
    border-radius: 1.5rem;
    padding: 0.7rem 1.5rem;
    font-size: 0.85rem;
    ${ props => props.$outline && css`
        background: var(--bg);
        color: var(--fg);
        border: 0.05rem solid var(--fg);
        padding: 0.5rem 1.2rem;
    ` }
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

export const FlexRow = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    ${ props => css`gap: ${props.gap}` }
`;

export const WrappingPre = styled.pre`
    white-space: pre-wrap;
    word-wrap: break-word;
    word-wrap: anywhere;
`;

export const CodeBlock = styled.pre`
    background: var(--bg-light);
    border-radius: 0.5rem;
    padding: 0.6rem;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    overflow-wrap: anywhere;
`;

export const ForceWrap = styled.div`
    max-width: 100%;
    overflow-wrap: break-word;
    overflow-wrap: anywhere;
    overflow: scroll;
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
            padding: "2rem", maxWidth: "50rem", width: "100%",
        }}>
            { children }
        </Stack>
    </CentererOuter>;

export const Header = () =>
    <Row style={{
        width: "100%",
        gridTemplateColumns: "max-content auto",
        justifyItems: "right",
        marginBottom: "1rem",
    }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ color: "white" }}> boikot 🙅‍♀️ </h2>
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

function MenuLink({ to, children }) {
    let style = {};
    if( location.pathname === to )
        style = { color: "white", fontWeight: "600" };
    return <Link to={to} style={style}>
        { children }
    </Link>;
}

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
            <MenuLink to="/"> home </MenuLink>
            <MenuLink to="/companies"> companies </MenuLink>
            <MenuLink to="/companies/edit"> add a company </MenuLink>
            <MenuLink to="/search"> search </MenuLink>
            <MenuLink to="/blog"> blog </MenuLink>
            <MenuLink to="/contact-us"> contact us </MenuLink>
        </Centerer>
    </ScreenFiller>;
}

export function IconButton( props ) {
    return <button onClick={ props.onClick }>
        <Row>
            <Icon {...{...props, onClick: undefined, children: undefined}} />
            { props.children }
        </Row>
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

export const Badge = styled.div`
    background: var(--accent-dark);
    border-radius: 1.2rem;
    border: 0.05rem solid var(--accent);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    color: white;
`;

function IconBadge({ children, i, flip, style }) {
    return <Badge style={style}>
        <Row gap="0.2rem">
            { flip && children }
            <Icon i={i} style={{ height: "0.9rem" }}/>
            { !flip && children }
        </Row>
    </Badge>;
}

export function DeleteableBadgeList({ items, deleteAtIndex = () => {} }) {
    if( !items?.length ) return null;
    return <FlexRow>
        { items.map( (item, i) =>
            <button onClick={() => deleteAtIndex(i)} key={item}>
                <IconBadge i="x" flip>
                    { item }
                </IconBadge>
            </button>
        ) }
    </FlexRow>;
}

export function Page({ children }) {
    return <CentererOuter style={{ minHeight: "100vh" }}>
        <Stack style={{
            padding: "2rem 2rem 1rem 2rem",
            maxWidth: "50rem",
            width: "100%",
            minHeight: "100vh",
            gridTemplateRows: "min-content 1fr min-content",
        }}>
            <Header />
            <div> { children } </div>
            <Footer />
        </Stack>
    </CentererOuter>;
}

export function Footer() {
    return <Stack style={{ marginTop: "3rem", fontSize: "0.9rem" }}>
        <hr />
        <FlexRow style={{ paddingLeft: "1rem", gap: "0.75rem 2rem" }}>
            <a href="https://github.com/boikot-xyz/boikot">
                <Icon i="github" height="1.75rem" />
            </a>
            <Link to="/contact-us"> contact us </Link>
            <VersionNumber />
        </FlexRow>
    </Stack>;
}

