#!/usr/bin/env node

import * as fs from "fs";
import slugify from "slugify";

function getNewEntry( entry ) {
    entry.ownedBy = entry.ownedBy ? [entry.ownedBy] : [];
    return entry;
}

console.log( "opening ./boikot.json" );
const original = JSON.parse( fs.readFileSync( "./boikot.json" ));

console.log( "parsing content, migrating data" );
for( const oldKey of Object.keys(original.companies) ) {
    const entry = structuredClone(original.companies[oldKey]);
    original.companies[oldKey] = getNewEntry(entry);
}
const output = JSON.stringify( original, null, 4 );

console.log( "writing to ./boikot.json" );
fs.writeFileSync( "./boikot.json", output );

