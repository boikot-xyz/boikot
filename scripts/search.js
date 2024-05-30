#!/usr/bin/env node

const { JSDOM } = require("jsdom");

async function scrape( url ) {

    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const links = [...document.querySelectorAll("a.result__link")];
    const descriptions = [...document.querySelectorAll("div.result__description")];
    return links.map( (a,i) => [
        a.textContent.trim(),
        a.href,
        descriptions[i].textContent.trim()
    ] );
}

async function searchEcosia( query, pages=5 ) {
    return ( await Promise.all(
       ( new Array(pages) ).fill(0).map( (_,i) =>
            scrape( `https://www.ecosia.org/search?q=${query}&p=${i}` )
        )
    ) ).flat();
}

( async () => {
    const info = await searchEcosia( process.argv[2] );
    console.log(
        "\n\n\n\n",
        JSON.stringify(info, null, 2),
        "\n\n\n\n"
    );
} )();

