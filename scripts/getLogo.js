#!/usr/bin/env node

const { JSDOM } = require("jsdom");


const searchEndpoint = searchQuery =>
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=description%7Cinfo&inprop=url&generator=prefixsearch&redirects=&gpssearch=${searchQuery}&gpsnamespace=0&gpslimit=1`;


async function getWikipediaPage( searchQuery ) {

    const response = await (await fetch(
        searchEndpoint(searchQuery))
    ).json();
    const page = response.query.pages[0];

    return page;
}

function getLogoUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img");

    const logoUrl = logoImg.src
        .match(/.+?\.svg/)[0]
        .replace("thumb/", "")
        .replace("//upload", "https://upload");

    return logoUrl;
}

function getSiteUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox.vcard tr th.infobox-label"
    )];
    const siteLabel = infoBoxLabels.filter( 
        el => el.innerHTML.includes("Website")
    )[0];
    const siteUrl = siteLabel.parentElement.querySelector("a").href;

    return siteUrl;
}

async function getInfo( searchQuery ) {

    const page = await getWikipediaPage( searchQuery );
    const pageHTML = await (await fetch(page.fullurl)).text();
    const pageDOM = new JSDOM( pageHTML );

    return {
        searchQuery: searchQuery,
        logoUrl: getLogoUrl( pageDOM ),
        siteUrl: getSiteUrl( pageDOM ),
        wikipediaUrl: page.fullurl,
        wikipediaTitle: page.title,
        wikipediaDescription: page.description,
    };
}

( async () => {
    const info = await getInfo( process.argv[2] );
    console.log( info );
} )();

