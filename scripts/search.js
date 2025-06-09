#!/usr/bin/env node

import { JSDOM } from "jsdom";
import esMain from 'es-main';


async function scrapeResults( url ) {
    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const links = [...document.querySelectorAll(".result__title a.result__link")];
    const descriptions = [...document.querySelectorAll("div.result__description")];
    return links.map( (a,i) => ({
        title: a.textContent.trim(),
        url: a.href,
        description: descriptions[i].textContent.trim()
    }) );
}

export async function searchEcosia( searchQuery, pages=5 ) {
    return ( await Promise.all(
       ( new Array(pages) ).fill(0).map( (_,i) =>
            scrapeResults( `https://www.ecosia.org/search?q=${encodeURIComponent(searchQuery)}&p=${i}` )
        )
    ) ).flat();
}

( async () => {
    if(esMain(import.meta)) {
        const company = process.argv[2];
        if( !company )
            process.exit(
                console.log( "error: supply company name as argument!" )
            );

        const info = await searchEcosia( company + " unethical", 5 );

        console.log( info.map( ({title, url, description}, i) => `${i+1}. ` + title + "\n" + url + "\n" + description ).join("\n\n") );
    }
} )();

