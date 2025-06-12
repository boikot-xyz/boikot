#!/usr/bin/env node

import readline from "readline";
import { JSDOM } from "jsdom";
import slugify from "slugify";
import boikot from "../boikot.json" with { type: "json" };
import * as dotenv from "dotenv";
import { askGroq, askQwen } from "./llm.js";

function unique( array ) {
    return array.filter( (item, index) => array.indexOf(item) === index );
}

export const getKey = name =>
    slugify(name).toLowerCase();


export function sortSources( summaryText, sources ) {
    const sourceMatches = summaryText.match(/\[(\d+)\]/g) ?? [];
    const sourceNumbers = sourceMatches.map( m => +m.match(/\d+/)[0] );

    const newSourceNumberMap = {};
    for( const sourceNumber of sourceNumbers )
        newSourceNumberMap[sourceNumber] =
            newSourceNumberMap[sourceNumber]
            || Object.keys(newSourceNumberMap).length + 1;

    const newSources = {};
    let newSummaryText = summaryText;
    for( const sourceNumber of sourceNumbers ) {
        newSummaryText = newSummaryText.replace(
            `[${sourceNumber}]`,
            `[%${newSourceNumberMap[sourceNumber]}]`
        );
        newSources[newSourceNumberMap[sourceNumber]] = sources[sourceNumber];
    }
    for( const sourceNumber of sourceNumbers )
        newSummaryText = newSummaryText.replace(
            `[%${newSourceNumberMap[sourceNumber]}]`,
            `[${newSourceNumberMap[sourceNumber]}]`
        );

    return [ newSummaryText, newSources ];
}


/*
async function getInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return await new Promise(resolve => rl.question("> ", ans => {
        rl.close();
        resolve(ans);
    }));
}

async function getUrls() {

    console.log("enter article URLs, blank to finish:");
    const urls = [];
    while( true ) {
        const url = await getInput();
        if( url ) urls.push(url);
        else break;
    }

    return urls;
}

const fetchOptions = {
    headers: {
        "Host": "www.houstonchronicle.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*\/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
    },
};

async function scrape( url ) {

    const pageHTML = await (await fetch(url, fetchOptions)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    let paragraphs = [...document.querySelectorAll("main p")];
    if( !paragraphs.length )
        paragraphs = [...document.querySelectorAll("p")];
    if( !paragraphs.length ) {
        console.log("could not get content from", url, "- please paste it here:");
        return await getInput();
    }

    const text = paragraphs.map(p => p.textContent.trim()).join(" ");
    return text;
}

function getTickers( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox.vcard tr th.infobox-label"
    )];
    const tradedLabel = infoBoxLabels.filter( 
        el => el.innerHTML.includes("Traded") 
    )[0];
    if( !tradedLabel ) return [];

    const tradedStrings = [...tradedLabel.parentElement.querySelectorAll("li")]
        .map(el => el.textContent)

    return unique( 
        tradedStrings
        .map( s => s.match( /[ a-z]+:\s([a-z]+)/i ) )
        .filter( match => match )
        .map( match => match[1] )
    );
}

import { askGroq } from "./llm.js";

( async () => {
    const company = process.argv[2];
    if( !company )
        process.exit(
            console.log( "error: supply company name as argument!" )
        );

    console.log( "Searching for unethical practices of", company );
    const info = await searchEcosia( company + " unethical" );

    const nArticles = 10;
    const prompt = 
`Imagine you are in investigative journalist looking into the ethics of ${company}. Following is a list of articles about ${company} - please select the ${nArticles} most relevant articles to read to investigate its unethical practices, and respond with their URLS in a json list.

${ info.map( ([title, url, description]) => title + "\n" + url + "\n" + description ).join("\n\n") }

Please respond with the urls of the ${nArticles} most relevant articles for looking into the unethical practices of ${company}, in json format eg.:

{
    "urls": [
        "https://article1.com",
        "https://article2.com",
        ...
    ]
}

The ${nArticles} most relevant article urls are:`;

    console.log(prompt);
    return
    const response = await askGroq(
        prompt,
        {
            "response_format": {
                "type": "json_object"
            },
        },
    );

    console.log( "\n\n" );
    console.log( response );
    console.log( "\n\n" );
} )();

*/
