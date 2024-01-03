import React from "react";
import styled from "styled-components";
import { PillButton, Page, Stack } from "./components.jsx";

function runSearches( query ) {
    window.open("https://google.com", '_blank');
}

export function Search() {
    const [ query, setQuery ] = React.useState("");
    return <Page>
        <Stack>
            <h1> Search </h1>
            <p> You can use this page to quickly run a number of
                searches against a company name 👀 <br/>
                this will open a few new tabs. </p>
            <input
                placeholder="enter a company name"
                value={ query }
                onChange={ e => setQuery(e.target.value) } />
            <PillButton
                style={{ justifySelf: "right" }}
                onClick={() => runSearches(query)}>
                search!
            </PillButton>
        </Stack>
    </Page>;
}

