import React from "react";
import styled from "styled-components";
import { Link, useParams, useSearchParams } from "react-router-dom";
import slugify from "slugify";
import { Helmet } from "react-helmet";

import { getKey, Badge, Card, FlexRow, Icon, IconButton, Page, PillButton, Row, Stack, TagBadge, ForceWrap } from "./components.jsx";
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

function Tags({ tags }) {
    return <FlexRow>
        { tags?.map( tag =>
            <TagBadge key={tag} style={{ fontSize: "0.7rem" }}>
                { tag }
            </TagBadge>
        )}
    </FlexRow>;
}

const clearParams = () => window.history.replaceState(
    {}, document.title, window.location.pathname );

function TagsFilter({ value, setValue }) {
    let allTags = Object.values(boikot.companies)
        .flatMap( entry => entry.tags )
        .toSorted();
    allTags = allTags.filter( (tag,i) => allTags.indexOf(tag) === i );
    return <FlexRow>
        <select style={{ maxWidth: "12rem", color: !value && "#fff6" }}
            onChange={ e => setValue(e.target.value) + clearParams() }
            value={value}>
            <option value="" label="Filter by Tag" hidden />
            { allTags.map( tag => <option value={tag} label={tag} /> ) }
        </select>
        { value && <IconButton i="x" gap="0.2rem"
            style={{ height: "1.4rem" }}
            onClick={ () => setValue("") + clearParams() }>
            clear filter
        </IconButton> }
    </FlexRow>;
}

function renderReferences({ comment, sources }) {
    const refs = comment.match(/\[\d+\]/g).map(ref =>
        <sup key={ref}><a href={sources[ref.match(/\d+/)]}
            target="_blank" rel="noreferrer noopener">
            { ref }
        </a></sup> );
    const chunks = comment.split(/\[\d+\]/g);
    return chunks.flatMap( (_,i) => [chunks[i], refs[i]] );
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
            <PillButton $outline style={{ justifySelf: "left" }}
                onClick={ () => setShowSources(!showSources) }>
                { showSources ? "🙈 Hide Sources" : "📰 Show Sources" }
            </PillButton> }
    </>;
}

function Owners({ entry }) {
    if( !entry.ownedBy.length ) return null;
    return <Stack style={{ padding: ".6rem 0" }}>
        <h3>
            { entry.names[0] } is owned by:
        </h3>
        { entry.ownedBy.map( code =>
            boikot.companies[code]
                ? <CompanyHeader link entry={boikot.companies[code]} />
                : code
        ) }
    </Stack>;
}

function Alternatives({ entry }) {
    const alternativeEntries = Object.values(boikot.companies)
        .filter( otherEntry =>
            otherEntry.tags.includes( entry.tags[0] )
            && otherEntry.names[0] !== entry.names[0]
            && otherEntry.comment
        ).sort( (a,b) =>
            b.score - a.score
        );
    if( !alternativeEntries.length ) return null;
    return <Card style={{ paddingBottom: 0 }}>
        <h3> Alternative companies tagged:{' '}
            <TagBadge>{ entry.tags[0] }</TagBadge>
        </h3>
        <Stack style={{
            maxHeight: "18rem", overflow: "scroll", paddingBottom: "1rem"
        }}>
            { alternativeEntries.map( otherEntry =>
                <CompanyHeader link entry={otherEntry} />
            ) }
        </Stack>
    </Card>;
}

function Subsidiaries({ entry }) {
    const subsidiaries = Object.values(boikot.companies).filter(
        other => other.ownedBy.includes( getKey(entry) ) );
    if( !subsidiaries.length ) return null;
    return <Stack style={{ padding: ".6rem 0" }}>
        <h3>
            Companies owned by { entry.names[0] }:
        </h3>
        { subsidiaries.map( entry =>
            <CompanyHeader link entry={entry} key={entry.names[0]} /> ) }
    </Stack>;
}

export function Company({ entry, compact }) {
    if( !entry?.names ) return null;

    return <Stack>
        <CompanyHeader entry={entry} link={!!compact} />
        <Tags tags={entry.tags} />
        { !compact && <h3 style={{ margin: ".5rem 0 -.5rem"}}>
            Is {entry.names[0]} Ethical?
        </h3> }
        { entry.comment && <Comment>
            { renderReferences(entry) }
        </Comment> }
        { !compact && <>
            <Sources entry={entry} />
            <Owners entry={entry} />
            <Alternatives entry={entry} />
            <Subsidiaries entry={entry} />
            <Link to={`/companies/edit/${getKey(entry)}`}>
                <PillButton $outline> ✏️  Edit this Company </PillButton>
            </Link>
            <Link to="/companies">
                <PillButton $outline> ↩️ Back to Companies </PillButton>
            </Link>
        </> }
    </Stack>;
}


export function CompanyDetail() {
    const { key } = useParams();
    return <Page>
        <Company entry={ boikot.companies[key] } />
    </Page>;
}


export function Score({ score }) {
    const emoji =
        score === null
        ? ""
        : score < 20
        ? "👺"
        : score < 40
        ? "😡"
        : score < 60
        ? "😐"
        : score < 80
        ? "😊"
        : "🥰";
    return <span title={`Ethical Score: ${score}/100`} style={{
        padding: "0 0.25rem .15rem .3rem",
        color: scoreColor(score),
        border: `0.175rem solid ${scoreColor(score)}`,
        borderRadius: "1.4rem",
    }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>
            { score } { emoji }
        </span>
    </span>
}


export function CompanyHeader({ entry, link = false }) {
    const companyURL =
        `/companies/${slugify(entry.names[0]).toLowerCase()}`;
    const LinkOrFrag = link
        ? props => <Link {...props} to={companyURL}
            style={{ textDecoration: "none" }} />
        : React.Fragment;
    return <LinkOrFrag>
        <Row gap="0.5rem" style={{ overflowX: "scroll" }}>
            <img src={entry.logoUrl}
                alt={`${entry.names[0]} logo`}
                style={{
                    width: "3rem",
                    height: "3rem",
                    padding: "0.25rem",
                    background: "white",
                    borderRadius: "0.5rem",
                    objectFit: "contain",
                    fontSize: "0.6rem",
                    wordWrap: "anywhere" }}/>
            <Stack gap="0" style={{ marginRight: "0.1rem" }}>
                <h3 style={{ textDecoration: link && "underline" }}>
                    {entry.names[0]}
                </h3>
                { !!entry.tags.length &&
                    <p style={{ color: "var(--fg)", fontSize: "0.8rem" }}>
                        { entry.tags[0] } 
                    </p> }
            </Stack>
            <Score {...entry} />
        </Row>
    </LinkOrFrag>;
}


function SearchBar({ value, setValue }) {
    return <div style={{
        width: "100%", display: "grid", position: "relative"
    }}>
        <input placeholder="🔍 search" value={value}
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
    const [ params ] = useSearchParams();
    const paramTag = params.get("tag");
    const [ search, setSearch ] = React.useState("");
    const [ tag, setTag ] = React.useState(paramTag || "");
    const companies = Object.values(boikot.companies)
        .filter( entry => !tag || entry.tags.includes(tag) )
        .filter( entry => search || tag || !!entry.comment )
        .filter( entry => entry.names.some( name =>
            name.toLowerCase().startsWith(search.toLowerCase())
        ) )
        .toSorted( (a, b) => a.names[0].localeCompare(b.names[0]) );
    return <Page>
        <Helmet>
            <title> boikot - companies </title>
            <meta name="description" content="Explore the ethical ratings of the world's biggest companies." />
        </Helmet>
        <Stack>
            <h1> Companies </h1>
            <SearchBar value={search} setValue={setSearch} />
            <TagsFilter value={tag} setValue={setTag} />
            { companies.map( entry =>
                <CompanyHeader entry={entry}
                    link key={entry.names[0]} />
            ) }
            <p> { companies.length } companies </p>
            <Link to="/companies/edit">
                <PillButton $outline> 📝 Add a company </PillButton>
            </Link>
        </Stack>
    </Page>;
}

