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

let allTags = Object.values(boikot.companies)
    .flatMap( entry => entry.tags )
    .toSorted();
allTags = allTags.filter( (tag,i) => allTags.indexOf(tag) === i );

const clearParams = () => window.history.replaceState(
    {}, document.title, window.location.pathname );

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
    let nameList = entry.ownedBy.map( code =>
        boikot.companies[code]?.names?.[0] || code
    );
    try {
        nameList = (new Intl.ListFormat("en")).format(nameList);
    } catch {
        nameList = nameList.join(", ");
    }

    return <Stack>
        <p>
            { entry.names[0] + " is " }
            { entry.ownedBy.length > 1 && "jointly "}
            owned by { nameList }.
        </p>
        { entry.ownedBy.map( code =>
            boikot.companies[code] && <Company
                key={code} compact entry={boikot.companies[code]} />
        ) }
    </Stack>;
}

function Alternatives({ entry }) {
    const alternativeEntries = Object.values(boikot.companies)
        .filter( otherEntry =>
            otherEntry.tags.includes( entry.tags[0] )
            && otherEntry.names[0] !== entry.names[0]
        ).sort( (a,b) =>
            b.score - a.score
        );
    if( !alternativeEntries.length ) return null;
    return <Card style={{ paddingBottom: 0 }} gap=".5rem">
        <h3> Alternatives to { entry.names[0] }: </h3>
        <p> Companies tagged <TagBadge>{ entry.tags[0] }</TagBadge> </p>
        <Stack style={{
            maxHeight: "18rem", overflow: "scroll", paddingBottom: "1rem"
        }}>
            { alternativeEntries.map( otherEntry =>
                <CompanyHeader
                    key={otherEntry.names[0]} link entry={otherEntry} />
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
        { !compact &&
            <h3 style={{ margin: ".5rem 0 -.5rem"}}>
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
                <PillButton $outline>
                    ↩️ Back to All Companies
                </PillButton>
            </Link>
        </> }
    </Stack>;
}


export function CompanyDetail() {
    const { key } = useParams();
    const entry = boikot.companies[key];
    return <Page>
        <Helmet>
            <title> {entry.names[0]} Ethics Report | boikot </title>
            <meta name="description" content={`Is ${entry.names[0]} Ethical? Read about the ethics of ${entry.names[0]}. ${entry.comment?.slice(0,100) ?? ""}`} />
        </Helmet>
        <Company entry={entry} />
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
    return <div style={{ display: "grid", position: "relative" }}>
        <input placeholder="🔍 search" value={value}
            onChange={e => setValue(e.target.value)}
            style={{ paddingRight: "2rem", minWidth: 0 }} />
        { value &&
            <IconButton i="x" onClick={() => setValue("")}
                style={{
                    position: "absolute",
                    right: ".25rem",
                    top: ".5rem",
                    height: "1.4rem"
                }}
            />
        }
    </div>;
}

const disabledSelectStyle = { minWidth: 0, color: "#fff6" };
const enabledSelectStyle = {
    minWidth: 0,
    color: "var(--fg)",
    borderRight: "none",
    borderRadius: ".5rem 0 0 .5rem",
    paddingRight: 0,
};

function SelectCancelButton({ onClick }) {
    return <div style={{
        background: "var(--bg-light)",
        paddingRight: ".25rem",
        display: "grid",
        placeItems: "center",
        height: "100%",
        border: "0.05rem solid var(--fg)",
        borderLeft: 0,
        borderRadius: "0 .5rem .5rem 0",
    }}>
        <IconButton i="x" style={{ height: "1.4rem" }} onClick={onClick} />
    </div>;
}

function TagsFilter({ value, setValue }) {
    return <Row gap="0" style={{ width: "10rem" }}>
        <select style={ value ? enabledSelectStyle : disabledSelectStyle }
            value={value}
            onChange={ e => setValue(e.target.value) + clearParams() }>
            <option value="" label="filter by tag" hidden />
            { allTags.map( tag => <option value={tag} label={tag} /> ) }
        </select>
        { value && <SelectCancelButton
            onClick={ () => setValue("") + clearParams() } /> }
    </Row>;
}

const sortOptions = {
    "sort by name":
        (a, b) => a.names[0].localeCompare(b.names[0]),
    "sort by score ascending":
        (a, b) => a.score - b.score,
    "sort by score descending":
        (a, b) => b.score - a.score,
    "sort by industry":
        (a, b) => a.tags[0].localeCompare(b.tags[0]),
};
const defaultSort = Object.keys(sortOptions)[0];

function Sort({ value, setValue }) {
    return <FlexRow style={{ marginTop: "-.4rem" }}>
        { Object.keys(sortOptions).map( key =>
            <PillButton $small key={key} $outline={ value !== key }
                onClick={() => setValue(key)}>
                { key }
            </PillButton> ) }
    </FlexRow>
}

export function Companies() {
    const [ params ] = useSearchParams();
    const paramTag = params.get("tag");
    const [ search, setSearch ] = React.useState("");
    const [ tag, setTag ] = React.useState(paramTag || "");
    const [ sort, setSort ] = React.useState(defaultSort);
    const companies = Object.values(boikot.companies)
        .filter( entry => !tag || entry.tags.includes(tag) )
        .filter( entry => entry.names.some( name =>
            name.toLowerCase().startsWith(search.toLowerCase())
        ) )
        .toSorted( sortOptions[sort] );
    return <Page>
        <Helmet>
            <title> Company Ethics Reports | boikot </title>
            <meta name="description" content="Explore the ethical ratings of the world's biggest companies." />
        </Helmet>
        <Stack>
            <h1> Companies </h1>
            <p> Here you can see all of our company ethics reports, with relevant tags, sources, ethics summaries and scores ranging from 0 to 100. </p>
            <div style={{ display: "grid", gap: ".5rem",
                    gridTemplateColumns: "1fr 10rem" }}>
                <SearchBar value={search} setValue={setSearch} />
                <TagsFilter value={tag} setValue={setTag} />
            </div>
            <Sort value={sort} setValue={setSort} />
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

