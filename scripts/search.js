#!/usr/bin/env node

import { JSDOM } from "jsdom";


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

