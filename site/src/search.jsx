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

const initialState = searchTermMakers.reduce(
    (acc, val) => ({ ...acc, [val]: {} }), {}
);

function runSearches( query ) {
    window.open(searchEngines[2].makeURL("test t.est+{}"), '_blank');
}

function SearchTermRow({
    searches, searchTerm, toggleSearch, getSearch
}) {
    window.searches = searches
    return <Stack gap="0.4rem">
        <ForceWrap>
            <p> "{ searchTerm }" </p>
        </ForceWrap>
        <Row style={{ justifySelf: "right", gap: "0.4rem" }}>
            { searchEngines.map( searchEngine =>
                <button onClick={toggleSearch(searchEngine)}>
                    <IconBadge i="circle" style={{
                        background: "transparent", borderColor: "grey",
                        background: getSearch(searchEngine) ? "red" : "blue"
                    }}>
                        <p style={{ fontSize: "0.7rem" }}>
                            { searchEngine.label }
                        </p>
                    </IconBadge>
                </button>
            ) }
        </Row>
        <hr style={{ opacity: "0.5" }} />
    </Stack>;
}


function SearchTerms({ searches, companyName, toggleSearch }) {
    return <Stack gap="1rem">
        <h2> Search Terms </h2>
        { searchTermMakers.map( searchTermMaker =>
            <SearchTermRow
                searches={searches}
                searchTerm={searchTermMaker(companyName)}
                toggleSearch={toggleSearch(searchTermMaker)}
                getSearch={searchEngine =>
                    searches[searchTermMaker][searchEngine] 
                } />
        ) }
    </Stack>;
}

const toggleSearch = setSearches => searchTermMaker => urlMaker => () =>
    setSearches( oldSearches => {
        let row = oldSearches[searchTermMaker];
        row[urlMaker] = !oldRow[urlMaker];
        return {
            ...oldSearches,
            searchTermMaker: row,
        };
    } );

export function Search() {
    const [ companyName, setCompanyName ] = React.useState("");
    const [ searches, setSearches ] = React.useState(initialState);
    return <Page>
        <Stack>
            <h1> Search </h1>
            <p> You can use this page to quickly run a number of
                searches against a company name 👀 <br/>
                this will open a few new tabs. </p>
            <input
                placeholder="enter a company name"
                value={ companyName }
                onChange={ e => setCompanyName(e.target.value) } />
            <PillButton
                style={{ justifySelf: "right" }}
                onClick={() => runSearches(companyName)}>
                search!
            </PillButton>
            <SearchTerms
                searches={searches}
                companyName={companyName}
                toggleSearch={toggleSearch} />
        </Stack>
    </Page>;
}

