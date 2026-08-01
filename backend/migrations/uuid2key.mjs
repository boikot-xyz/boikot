#!/usr/bin/env node

import * as fs from "fs";
import slugify from "slugify";

function getNewKey( entry ) {
    return slugify(entry.names[0] || "").toLowerCase();
}

console.log( "opening ./boikot.json" );
const original = JSON.parse( fs.readFileSync( "./boikot.json" ));

console.log( "parsing content, migrating data" );
for( const oldKey of Object.keys(original) ) {
    const entry = structuredClone(original[oldKey]);
    delete original[oldKey];
    original[getNewKey(entry)] = entry;
}
const output = JSON.stringify( original, null, 4 );

console.log( "writing to ./boikot.json" );
fs.writeFileSync( "./boikot.json", output );

