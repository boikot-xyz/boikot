import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { Page, Stack } from "./components.jsx";
import { CompanyHeader } from "./companies.jsx";
import boikot from "../../boikot.json";

export function Home() {
    return <Page>
        <Stack>
            <h1> boikot is a community-led initiative to make
                data on company ethics transparent and accessible. </h1>
            <p> We are building a community-curated, transparent, freely
                accessible collection of corporate ethics records. By
                documenting ethical and unethical business practices,
                we aim to inform consumer choice, raise the cost of
                harmful business decisions, and incentivise companies to
                act responsibly in the public interest. </p>
            <h1 style={{ marginTop: "1rem" }}> worst offenders 💩 </h1>
            { Object.values(boikot.companies)
                .filter( entry => !!entry.comment )
                .toSorted( (a,b) => a.score - b.score )
                .slice(0, 10)
                .map( entry => <CompanyHeader entry={ entry } link /> ) }
            <Link to="/companies"> view all company records </Link>
            <Link to="/companies/edit">
                get involved by adding a new company
            </Link>
        </Stack>
    </Page>
}

