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

export function Company({entry}) {
    if( !entry.names ) return null;

    return <Stack>
        <CompanyHeader entry={entry} />
        <p style={{ lineHeight: "1.5rem" }}>
            { entry.comment }
        </p>
        { !!entry.ownedBy.length && <p>
            { entry.names[0] } is owned by{" "}
            <Link to={`/companies/${slugify(entry.ownedBy[0]).toLowerCase()}`}>
                { ownerName(entry.ownedBy[0]) }
            </Link>.
        </p> }
        { !!Object.keys(entry.sources).length && <h3> Sources </h3> }
        { Object.entries(entry.sources).map( ([ key, url ]) =>
            <ForceWrap key={key}> <p>
                [{key}] <a href={url}>
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
        { link
            ? <Link to={
                `/companies/${slugify(entry.names[0]).toLowerCase()}`
            }>
                <h3>{entry.names[0]}</h3>
            </Link>
            : <h3>{entry.names[0]}</h3>
        }
        <h3 style={{
            paddingTop: "0.15rem",
            color: scoreColor(entry.score) }}>
            {entry.score}
        </h3>
    </Row>;
}


export function Companies() {
    return <Page>
        <Stack>
            <h1> Companies </h1>
            <Link to="/companies/edit"> ➕ add a company </Link>
            { Object.values(boikot.companies).map( entry =>
                <CompanyHeader entry={entry} link key={entry.names[0]} />
            ) }
        </Stack>
    </Page>;
}

