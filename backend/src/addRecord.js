#!/usr/bin/env node

import * as fs from "fs";
import slugify from "slugify";


function getCompanyKey( companyName ) {
    return slugify( companyName ).toLowerCase();
}


export async function addRecord( companyEntry, boikotJsonPath="../boikot.json" ) {
    const companyKey = getCompanyKey( companyEntry.names[0] );
    const boikot = JSON.parse( await fs.promises.readFile( boikotJsonPath ));

    if( boikot.companies[companyKey] )
        throw `dataset already contains an entry for ${companyKey}`;
    
    boikot.companies[companyKey] = companyEntry;

    const output = JSON.stringify( boikot, null, 4 );

    console.log( `writing to ${boikotJsonPath}` );
    await fs.promises.writeFile( boikotJsonPath, output );
}

