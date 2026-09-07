#!/usr/bin/env node

import { JSDOM } from "jsdom";
import { searchEcosia } from "./search.js";
import { fetch } from "fetch-h2";
import { askLocalGPTOSS, askLocal } from "./llm.js";
import { getNamesPrompt } from "./prompts.js";


export async function getWikipediaPage( companyName ) {
    try {
        return (await searchEcosia( companyName + " company wikipedia", 1 ))[0].url;
    } catch(e) {
        const response = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${companyName}&limit=10`);
        const results = await response.json();
        return `https://en.wikipedia.org/wiki/${results.pages[0].key}`;
    }
}

function getLogoURL( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img") ??
        document.querySelector("a[title=\"Logo\"] img");

    const logoURL = logoImg?.src
        .replace("//upload", "https://upload")
        .replace(/\?.+/, "");
        //.replace(/\.svg.+/, ".svg");
        //.replace(/\/\d+px[^/]+.(png|jpg)$/, "");

    return logoURL;
}

function getFirstParagraph( pageDOM ) {

    const document = pageDOM.window.document;
    const firstP = [...document.querySelectorAll("#bodyContent p")].filter(el => !!el.textContent.trim())[0];

    return firstP.textContent;
}

function getInfoBox( pageDOM ) {

    const document = pageDOM.window.document;
    const rows = [...document.querySelectorAll(".infobox tr")];
    const texts = rows
        .map( row =>
            [row.querySelector("th"), row.querySelector("td")]
        ).map( ([th, td]) => {
            const lis = [...td?.querySelectorAll("li") || []];
            return `${th?.textContent || ""}    ${lis.length ? lis.map(li => li.textContent).join("    ") : td?.textContent || ""}`
        });

    return texts.join("\n");
}

function getTopText( pageDOM ) {
    return `${getFirstParagraph(pageDOM)}\n${getInfoBox(pageDOM)}`;
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
    const siteURL = siteLabel?.querySelector("a")?.href;

    return siteURL;
}

export async function getWikipediaInfo( companyName, companyUrl ) {

    const wikiPageURL = companyUrl || await getWikipediaPage( companyName );
    const wikiPageHTML = await (await fetch(wikiPageURL)).text();
    const wikiPageDOM = new JSDOM( wikiPageHTML );

    return {
        wikipediaUrl: wikiPageURL,
        logoUrl: getLogoURL( wikiPageDOM ),
        siteUrl: getSiteURL( wikiPageDOM ),
    };
}

export async function getNames( companyName, companyUrl ) {

    const wikiPageURL = companyUrl || await getWikipediaPage( companyName );
    const wikiPageHTML = await (await fetch(wikiPageURL)).text();
    const wikiPageDOM = new JSDOM( wikiPageHTML );
    const topText = getTopText( wikiPageDOM );

    const llmPrompt = getNamesPrompt( companyName, topText );
    console.log(llmPrompt);
    const response = await askLocal( llmPrompt, { model: "gemma4:26b" } );
    const names = [companyName, ...response.split("; ")].map(x => x.replace("NYSE: ", ""));
    return names.reduce( (acc, val) => acc.indexOf(val) < 0 ? [...acc, val] : acc, []);
}
