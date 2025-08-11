#!/usr/bin/env node

import boikot from "../../boikot.json" with { type: "json" };

export function getRecord( companyName ) {
    return Object.values(boikot.companies)
        .find( company =>
            company.names
                .map( x => x.toLowerCase() )
                .includes( companyName.toLowerCase() )
        );
}

