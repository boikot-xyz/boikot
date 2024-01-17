import React from "react";
import styled from "styled-components";
import { Link, useLoaderData } from "react-router-dom";
import slugify from "slugify";

import { Page, Row, Stack, ForceWrap } from "./components.jsx";
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

export function Company({entry}) {
    if( !entry.names ) return null;

    return <Stack>
        <CompanyHeader entry={entry} />
        { entry.comment && <Comment>
            { renderReferences(entry) }
        </Comment> }
        { !!entry.ownedBy.length && <p>
            { entry.names[0] } is owned by{" "}
            <Link to={`
                /companies/${slugify(entry.ownedBy[0]).toLowerCase()}`
            }>
                { ownerName(entry.ownedBy[0]) }
            </Link>.
        </p> }
        { !!Object.keys(entry.sources).length && <h3> Sources </h3> }
        { Object.entries(entry.sources).map( ([ key, url ]) =>
            <ForceWrap key={key}> <p>
                <strong>[{key}]</strong> <a href={url}>
                    {url}
                </a>
            </p> </ForceWrap>
        ) }
        <Link to="/companies"> ↩️ back to companies </Link>
    </Stack>;
}


export function CompanyDetail() {
    const { key } = useLoaderData();
    return <Page>
        <Company entry={ boikot.companies[key] } />
    </Page>;
}


export function CompanyHeader({ entry, link = false }) {
    const LinkOrFrag = link ? Link : React.Fragment;
    return <Row>
        { entry.logoUrl && <img
            src={entry.logoUrl}
            style={{
                width: "3rem",
                height: "3rem",
                padding: "0.25rem",
                background: "white",
                borderRadius: "0.5rem",
                objectFit: "contain" }}/> }
        <LinkOrFrag to={ `/companies/${slugify(entry.names[0]).toLowerCase()}` }>
            <h3>{entry.names[0]}</h3>
        </LinkOrFrag>
        <h3 style={{
            color: scoreColor(entry.score) }}>
            {entry.score}
        </h3>
    </Row>;
}


export function Companies() {
    const companies = Object.values(boikot.companies)
        .filter( entry => !!entry.comment )
        .toSorted( (a, b) => a.names[0].localeCompare(b.names[0]) );
    return <Page>
        <Stack>
            <h1> Companies </h1>
            <Link to="/companies/edit"> ➕ add a company </Link>
            { companies.map( entry =>
                <CompanyHeader entry={entry} link key={entry.names[0]} />
            ) }
            <p> { companies.length } companies </p>
        </Stack>
    </Page>;
}

