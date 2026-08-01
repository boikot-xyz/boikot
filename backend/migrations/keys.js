#!/usr/bin/env node

import * as fs from "fs";
import { fetch } from 'fetch-h2'

( async () => {


console.log( "opening ../boikot.json" );
const original = JSON.parse( fs.readFileSync( "../boikot.json" ));

console.log( "parsing content, migrating data" );
for( const key of Object.keys(original.companies) ) {
    const entry = original.companies[key];
    entry.key = key;
}
const output = JSON.stringify( original, null, 4 );

console.log( "writing to ../boikot.json" );
fs.writeFileSync( "../boikot.json", output );


} )();


