#!/usr/bin/env node

import * as fs from "fs";
import { fetch } from 'fetch-h2'

// https://upload.wikimedia.org/wikipedia/commons/4/44/Insinkerator_logo.svg
// https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Insinkerator_logo.svg/120px-Insinkerator_logo.svg.png

( async () => {


console.log( "opening ../boikot.json" );
const original = JSON.parse( fs.readFileSync( "../boikot.json" ));

console.log( "parsing content, migrating data" );
for( const key of Object.keys(original.companies) ) {
    await new Promise(r => setTimeout(r, 1000));
    const entry = original.companies[key];

    if(entry.logoUrl?.includes("upload.wikimedia.org/wikipedia/commons") && !entry.logoUrl?.includes("thumb")) {
        const response = await fetch(entry.logoUrl);
        const size = +response.headers.get('content-length');
        console.log(response.status, size, key, entry.logoUrl);

        if( size > 5000 ) {
          const path = entry.logoUrl.split("/commons/")[1];
          const filename = path.split("/")[2];
          entry.logoUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/120px-${filename}.png`;
          console.log("changed to", entry.logoUrl);
        }
    }
}
const output = JSON.stringify( original, null, 4 );

console.log( "writing to ../boikot.json" );
fs.writeFileSync( "../boikot.json", output );


} )();

