#!/usr/bin/env node

import * as fs from "fs";
import slugify from "slugify";

function getNewEntry( entry, original ) {
    if( !entry.ownedBy.length ) return entry;
    const parent = original.companies[entry.ownedBy[0]];
    if( !parent ) return;
    if( !entry.score ) entry.score = parent.score;
    if( !entry.tags.length ) entry.tags = [parent.tags[0]];
    return entry;
}

console.log( "opening ./boikot.json" );
const original = JSON.parse( fs.readFileSync( "./boikot.json" ));

console.log( "parsing content, migrating data" );
for( const oldKey of Object.keys(original.companies) ) {
    const entry = structuredClone(original.companies[oldKey]);
    original.companies[oldKey] = getNewEntry(entry, original);
}
const output = JSON.stringify( original, null, 4 );

console.log( "writing to ./boikot.json" );
fs.writeFileSync( "./boikot.json", output );

