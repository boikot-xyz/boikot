import React from "react";
import styled from "styled-components";

import { Row, Stack } from "./components.jsx";
import boikot from "../../boikot.json";


const scoreColor = x =>
    `hsl(${x}deg 100% 60%)`;


function Company({entry}) {
    if( !entry.names ) return null;

    return <Stack>
        <Row>
            { entry.logoUrl && <img
                src={entry.logoUrl}
                style={{
                    width: "3rem",
                    height: "3rem",
                    objectFit: "contain" }}/> }
            <h2>{entry.names[0]}</h2>
            <h3 style={{
                paddingTop: "0.15rem",
                color: scoreColor(entry.score) }}>
                {entry.score}
            </h3>
        </Row>
        <p style={{ lineHeight: "1.5rem" }}>{entry.comment}</p>
        { entry.ownedBy &&
            <p> { entry.names[0] } is owned by { entry.ownedBy }. </p> }
        { !!Object.keys(entry.sources).length && <h3> Sources </h3> }
        { Object.entries(entry.sources).map( ([ key, url ]) =>
            <p> [{key}] <a href={url} style={{ wordWrap: "anywhere" }}>
                {url}
            </a> </p>
        ) }
    </Stack>;
}


export function Companies() {

    return <Stack gap="3rem">
        <h1 style={{ marginTop: "2rem" }}> Companies </h1>
        { Object.values(boikot.companies).map(
            entry => <Company entry={entry} />
        ) }
    </Stack>;
}

