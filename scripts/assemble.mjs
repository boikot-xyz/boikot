#!/usr/bin/env node

import readline from "readline";
import { JSDOM } from "jsdom";
import slugify from "slugify";
import boikot from "../boikot.json" assert { type: "json" };

function unique( array ) {
    return array.filter( (item, index) => array.indexOf(item) === index );
}

export const getKey = name =>
    slugify(name).toLowerCase();


// === IO ===

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


// === llm interface ===

const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";

async function askLlama( prompt, ollamaEndpoint=DEFAULT_OLLAMA_ENDPOINT ) {
    const ollamaResponse = await fetch( ollamaEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openhermes",
            stream: false,
            prompt: prompt,
        })
    });
    return ( await ollamaResponse.json() ).response;
}

const summaryPrompt = text =>
    `Here is some text scraped from a webpage:\n\n${text}\n\nPlease succinctly summarise the content of the webpage.`;

async function summarise( url ) {
    const text = await scrape(url);
    const summary = await askLlama( summaryPrompt(text) );
    console.log(url, "summary:", summary );
    return { url, summary, text };
}

const commentPrompt = text =>
    `Here are some examples of two-sentence company summaries:\n\n${boikot.companies.apple.comment}\n\n${boikot.companies.bbc.comment}\n\n${boikot.companies.sony.comment}\n\nHere is some text:\n\n${text}\n\nPlease summarise that text into a two-sentence company summary like those above, including a few words on all the key points. After you include information from a given section, make sure to include its refernce marter eg. [1], [2] & [3]. Respond with the two-sentence summary only. Your summary:`;

async function getComment( summaries ) {
    const text = summaries.map(
        (summary, i) => `${summary.summary.replace(/\.$/, '')} [${i+1}].`
    ).join(" ");
    const comment = await askLlama( commentPrompt(text) );
    // console.log( "\n\n===== assemble prompt =====\n\n", commentPrompt(text), "\n\n==========\n\n" );
    return comment;
}

async function getCompanyName( comment ) {
    return askLlama( `Here is some company information: "${comment}". Please respond with the name of the company only and no other text. The company name is:` );
}

async function getNames( companyName ) {
    const namesString = ( await askLlama( 
        `Please respond with a list of 7 commonly used names for the ${companyName} company, in the format: [ "name1", "name2", ... ]`
    ) ).replaceAll(/\n/g, "");
    if( !namesString.match( /^\s*\[\s*(".+")+\s*\]\s*$/ ) ) return [ companyName ];

    try {
        const names = eval( namesString );
        return unique([ companyName, ...names ]);
    } catch {
        return [ companyName ];
    }
}

async function getTags( companyName ) {
    const tagsString = ( await askLlama( 
        `Please respond with a list of 7 tags, not necessariliy from the list above, that could apply to the ${companyName} company, in the format: [ "tag1", "tag2", ... ]`
    ) ).replaceAll(/\n/g, "");
    if( !tagsString.match( /^\s*\[\s*(("|').+("|'),?)+\s*\]\s*$/ ) ) return [];

    try {
        return eval( tagsString );
    } catch {
        return [];
    }
}

// === web scraping ===

const fetchOptions = {
    headers: {
        "Host": "www.houstonchronicle.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
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
    if( !response.query ) return null;
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
        .match(/.+?\.svg/)?.[0]
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
           || el.innerHTML.includes("URL")
    )[0];
    const siteUrl = siteLabel?.parentElement.querySelector("a").href;

    return siteUrl;
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

async function getInfo( searchQuery, showExtraInfo = false ) {

    const page = await getWikipediaPage( searchQuery );
    if( !page ) return { tickers: [] };

    const pageHTML = await (await fetch(page.fullurl)).text();
    const pageDOM = new JSDOM( pageHTML );

    return {
        logoUrl: getLogoUrl( pageDOM ),
        siteUrl: getSiteUrl( pageDOM ),
        tickers: getTickers( pageDOM ),
    };
}



async function main() {
    console.log("boikot assemble 🧩\nenter urls:\n");

    const urls = await getUrls();
    const sources = urls.reduce(
        (res, url, i) => ({ ...res, [i+1]: url }), {}
    );

    const summaries = [];
    for( const url of urls )
        summaries.push( await summarise( url ) );

    const comment = await getComment( summaries );

    const companyName = await getCompanyName( comment );

    console.log( "companyName:", companyName );

    const { logoUrl, siteUrl, tickers } = await getInfo( companyName );
    const names = await getNames( companyName );
    const tags = await getTags( companyName );

    console.log( "\n\n", comment, "\n\nscore?" );
    const scoreString = await getInput();

    const output = {
        names: [ ...names, ...tickers ],
        comment,
        sources,
        tags,
        score: parseInt(scoreString),
        ownedBy: [],
        logoUrl,
        siteUrl,
        updatedAt: (new Date()).toISOString(),
    };

    console.log( "\n\n", `"${ getKey(names[0]) }":`, JSON.stringify(output, null, 4), "\n\n" );
}

main();

