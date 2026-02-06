#!/usr/bin/env node

import { fetch } from 'fetch-h2';

import { JSDOM } from "jsdom";
import esMain from 'es-main';


const fetchOptions = {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Sec-GPC": "1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "method": "GET",
    "mode": "cors"
};


async function scrapeResults( url ) {
    const pageHTML = await (await fetch(url, fetchOptions)).text();
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

