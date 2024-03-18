#!/usr/bin/env node

const { JSDOM } = require("jsdom");


const searchEndpoint = searchQuery =>
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=description%7Cinfo&inprop=url&generator=prefixsearch&redirects=&gpssearch=${searchQuery}&gpsnamespace=0&gpslimit=2`;

const isNotDisambiguation = page =>
    !page.description
        .includes("Topics referred to by the same term");

async function getWikipediaPage( searchQuery ) {

    const response = await (await fetch(
        searchEndpoint(searchQuery))
    ).json();
    // Log search results
    // console.log(JSON.stringify(response, null, 4));
    const page = response.query.pages
        .filter(isNotDisambiguation)[0];

    return page;
}

function getLogoUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img");

    const logoUrl = logoImg?.src
        .replace("thumb/", "")
        .replace("//upload", "https://upload");

    return logoUrl;
}

function getSiteUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox tr"
    )];
    const siteLabel = infoBoxLabels.filter( 
        el => el.innerHTML.includes("Website") 
           || el.innerHTML.includes("URL")
    )[0];
    const siteUrl = siteLabel?.querySelector("a").href;

    return siteUrl;
}

async function getInfo( searchQuery, showExtraInfo = false ) {

    const page = searchQuery.match("^https")
        ? { fullurl: searchQuery }
        : await getWikipediaPage( searchQuery );
    const pageHTML = await (await fetch(page.fullurl)).text();
    const pageDOM = new JSDOM( pageHTML );

    const extraInfo = {
        searchQuery: searchQuery,
        wikipediaUrl: page.fullurl,
        wikipediaTitle: page.title,
        wikipediaDescription: page.description,
    };

    return {
        logoUrl: getLogoUrl( pageDOM ),
        siteUrl: getSiteUrl( pageDOM ),
        ...( showExtraInfo ? extraInfo : {} ),
    };
}

( async () => {
    const info = await getInfo( process.argv[2] );
    console.log(
        "\n\n\n\n",
        JSON.stringify(info, null, 2),
        "\n\n\n\n"
    );
} )();

