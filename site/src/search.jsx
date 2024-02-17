import React from "react";
import styled from "styled-components";
import { ForceWrap, IconBadge, PillButton, Page, Stack, Row } from "./components.jsx";

const searchTermMakers = [
    companyName => `${companyName}`,
    companyName => `${companyName} ethical`,
    companyName => `${companyName} unethical`,
    companyName => `${companyName} scandal`,
];

const searchEngines = [
    {
        label: "ecosia",
        makeURL: companyName =>
            "https://www.ecosia.org/search" +
            `?method=index&q=${encodeURIComponent(companyName)}`
    },
    {
        label: "google",
        makeURL: companyName =>
            "https://www.google.com/search" +
            `?q=${encodeURIComponent(companyName)}`
    },
    {
        label: "duckduckgo",
        makeURL: companyName =>
            "https://duckduckgo.com/" +
            `?q=${encodeURIComponent(companyName)}`
    },
];

function SearchTermRow({ searchTerm }) {
    return <Stack gap="0.4rem">
        <ForceWrap>
            <p> "{ searchTerm }" </p>
        </ForceWrap>
        <Row style={{ justifySelf: "right", gap: "0.4rem" }}>
            { searchEngines.map( searchEngine =>
                <a href={searchEngine.makeURL(searchTerm)}
                    target="_blank" rel="noreferrer noopener"
                    key={searchEngine.label}>
                    <IconBadge i="search">
                        <p style={{ fontSize: "0.7rem" }}>
                            { searchEngine.label }
                        </p>
                    </IconBadge>
                </a>
            ) }
        </Row>
        <hr style={{ opacity: "0.5" }} />
    </Stack>;
}


function SearchTerms({ companyName }) {
    return <Stack gap="1rem">
        { searchTermMakers.map( searchTermMaker =>
            <SearchTermRow
                searchTerm={searchTermMaker(companyName || "...")}
                key={searchTermMaker()} />
        ) }
    </Stack>;
}

export function Search() {
    const [ companyName, setCompanyName ] = React.useState("");
    return <Page>
        <Stack>
            <h1> Search </h1>
            <p> You can use this page to quickly run a number of
                searches against a company name 👀 </p>
            <input
                placeholder="enter a company name"
                value={ companyName }
                onChange={ e => setCompanyName(e.target.value) } />
            <SearchTerms companyName={companyName} />
        </Stack>
    </Page>;
}

