import React from "react";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import slugify from "slugify";

import { getKey, Badge, Icon, IconButton, Page, PillButton, Row, Stack, ForceWrap } from "./components.jsx";
import boikot from "../../boikot.json";


const scoreColor = x =>
    `hsl(${x}deg 100% 60%)`;

const ownerName = ownerKey =>
    boikot.companies[ownerKey]?.names[0] || ownerKey;

const Comment = styled.p`
    lineHeight: 1.5rem;
    sup {
        color: var(--accent);
    }
`;

function renderReferences({ comment, sources }) {
    const chunks = comment.split(/(?=\[\d+\])|(?<=\[\d+\])/);
    return chunks.map( chunk =>
        chunk.match(/\[\d+\]/)
            ? <sup><a href={sources[chunk.match(/\d+/)]}
                target="_blank" rel="noreferrer noopener">
                { chunk }
            </a></sup>
            : <span>{ chunk }</span>
    );
}

function Sources({ entry }) {
    const [ showSources, setShowSources ] = React.useState(false);
    return <>
        { showSources && <h3> 📰 Sources </h3> }
        { showSources &&
            Object.entries(entry.sources).map( ([ key, url ]) =>
                <ForceWrap key={key}> <p>
                    <strong>[{key}]</strong> <a href={url}>
                        {url}
                    </a>
                </p> </ForceWrap> ) }
        { !!Object.keys(entry.sources).length &&
            <PillButton $outline
                onClick={ () => setShowSources(!showSources) }>
                { showSources ? "Hide Sources" : "📰 Show Sources" }
            </PillButton> }
    </>;
}

function Subsidiaries({ entry }) {
    const subsidiaries = Object.values(boikot.companies).filter(
        other => other.ownedBy.includes( getKey(entry) ) );
    if( !subsidiaries.length ) return null;
    return <>
        <h3 style={{ paddingTop: "1rem" }}>
            Companies owned by { entry.names[0] }
        </h3>
        { subsidiaries.map( entry =>
            <CompanyHeader link entry={entry} /> ) }
    </>;
}

export function Company({entry}) {
    if( !entry.names ) return null;

    return <Stack>
        <CompanyHeader entry={entry} />
        { entry.comment && <Comment>
            { renderReferences(entry) }
        </Comment> }
        { !!entry.ownedBy.length && <p>
            { entry.names[0] } is owned by{" "}
            <Link to={
                `/companies/${slugify(entry.ownedBy[0]).toLowerCase()}`
            }>
                { ownerName(entry.ownedBy[0]) }
            </Link>.
        </p> }
        <Sources entry={entry} />
        <Subsidiaries entry={entry} />
    </Stack>;
}


export function CompanyDetail() {
    const { key } = useParams();
    return <Page>
        <Company entry={ boikot.companies[key] } />
    </Page>;
}


function Score({ score }) {
    return <div title={`Ethical Score: ${score}/100`} style={{
        width: "2rem",
        height: "2rem",
        padding: "0.2rem",
        color: scoreColor(score),
        border: `0.175rem solid ${scoreColor(score)}`,
        borderRadius: "1.4rem",
        display: "grid",
        placeItems: "center",
    }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>
            { score }
        </span>
    </div>
}


export function CompanyHeader({ entry, link = false }) {
    const LinkOrFrag = link ? Link : React.Fragment;
    const companyURL =
        `/companies/${slugify(entry.names[0]).toLowerCase()}`;
    return <LinkOrFrag to={companyURL}
        style={{ textDecoration: "none" }}>
        <Row gap="0.5rem">
            <img src={entry.logoUrl}
                style={{
                    width: "3rem",
                    height: "3rem",
                    padding: "0.25rem",
                    background: "white",
                    borderRadius: "0.5rem",
                    objectFit: "contain" }}/>
            <LinkOrFrag to={companyURL}>
                <h3>{entry.names[0]}</h3>
            </LinkOrFrag>
            <Score {...entry} />
            { !!entry.tags.length &&
                <Badge style={{ fontSize: "0.75rem" }}>
                    { entry.tags[0] }
                </Badge>
            }
        </Row>
    </LinkOrFrag>;
}


function SearchBar({ value, setValue }) {
    return <div style={{
        width: "100%", display: "grid", position: "relative"
    }}>
        <input placeholder="search" value={value}
            onChange={e => setValue(e.target.value)}
            style={{ paddingRight: "2rem" }}/>
        { value &&
            <IconButton i="x" onClick={() => setValue("")}
                style={{
                    position: "absolute",
                    right: ".25rem",
                    top: ".35rem",
                    height: "1.6rem"
                }}
            />
        }
    </div>;
}


export function Companies() {
    const [ search, setSearch ] = React.useState("");
    const companies = Object.values(boikot.companies)
        .filter( entry => search || !!entry.comment )
        .filter( entry =>
            entry.names.join('').toLowerCase()
            .includes(search.toLowerCase()) )
        .toSorted( (a, b) => a.names[0].localeCompare(b.names[0]) );
    return <Page>
        <Stack>
            <h1> Companies </h1>
            <SearchBar value={search} setValue={setSearch} />
            { companies.map( entry =>
                <CompanyHeader entry={entry}
                    link key={entry.names[0]} />
            ) }
            <p> { companies.length } companies </p>
            <Link to="/companies/edit"> ➕ add a company </Link>
        </Stack>
    </Page>;
}

