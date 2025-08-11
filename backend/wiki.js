#!/usr/bin/env node

import { JSDOM } from "jsdom";
import { searchEcosia } from "./search.js";


export async function getWikipediaPage( companyName ) {

    return (await searchEcosia( companyName + " company wikipedia", 1 ))[0].url;
}

function getLogoURL( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img");

    const logoURL = logoImg?.src
        .replace("thumb/", "")
        .replace("//upload", "https://upload")
        .replace(/\/[^/]+.(png|jpg)$/, "");

    return logoURL;
}

function getSiteURL( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox tr"
    )];
    const siteLabel = infoBoxLabels.filter( 
        el => el.innerHTML.includes("Website") 
           || el.innerHTML.includes("URL")
    )[0];
    const siteURL = siteLabel?.querySelector("a").href;

    return siteURL;
}

export async function getWikipediaInfo( companyName ) {

    const wikiPageURL = await getWikipediaPage( companyName );
    const wikiPageHTML = await (await fetch(wikiPageURL)).text();
    const wikiPageDOM = new JSDOM( wikiPageHTML );

    return {
        wikipediaUrl: wikiPageURL,
        logoUrl: getLogoURL( wikiPageDOM ),
        siteUrl: getSiteURL( wikiPageDOM ),
    };
}

