import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { FlexRow, Page, PillButton, Stack } from "./components.jsx";
import { CompanyHeader, Score } from "./companies.jsx";
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
            <FlexRow>
                <Link to="/companies">
                    <PillButton $outline>
                        🧐 View all company records
                    </PillButton>
                </Link>
                <Link to="/companies/edit">
                    <PillButton $outline>
                        🤝 Get involved by adding a new company
                    </PillButton>
                </Link>
            </FlexRow>
            <h2 style={{ marginTop: "1rem" }}> Score your Statement 📊 </h2>
            <p> run a bank statement against our database to see how
                ethical the purchases you make are. </p>
            <Link to="/statement-score">
                <PillButton style={{ justifySelf: "left" }}>
                    score your statement!
                </PillButton>
            </Link>
            <h2 style={{ marginTop: "1rem" }}> our ratings ⚖️  </h2>
            <p style={{ lineHeight: "1.4rem" }}>
                We rank companies on a scale from <Score score="0" />{" "}
                to <Score score="100"/>, based on their positive and
                negative actions, with <Score score="50" /> being a
                neutral score.  If you disagree with a company score,
                please submit an updated record for it! </p>
        </Stack>
    </Page>
}

