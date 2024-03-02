#!/usr/bin/env node

import  readline from "readline";
import { JSDOM } from "jsdom";
import boikot from "../boikot.json" assert { type: "json" };


const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";
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

async function askLlama( ollamaEndpoint, prompt ) {
    const ollamaResponse = await fetch( ollamaEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gemma",
            stream: false,
            prompt: prompt,
        })
    });
    return ( await ollamaResponse.json() ).response;
}

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

const summaryPrompt = text =>
    `Here is some text scraped from a webpage:\n\n${text}\n\nPlease succinctly summarise the content of the webpage.`;

async function summarise( ollamaEndpoint, url ) {
    const text = await scrape(url);
    const summary = await askLlama( ollamaEndpoint, summaryPrompt(text) );
    console.log(url, "summary:", summary );
    return { url, summary, text };
}

const commentPrompt = text =>
    `Here are some examples of two-sentence company summaries:\n\n${boikot.companies.apple.comment}\n\n${boikot.companies.bbc.comment}\n\n${boikot.companies.sony.comment}\n\nHere is some text:\n\n${text}\n\nPlease summarise that text into a two-sentence company summary like those above, including a few words on all the key points. After you include information from a given section, make sure to include its refernce marter eg. [1], [2], [3]...`;

async function getComment( ollamaEndpoint, summaries ) {
    const text = summaries.map(
        (summary, i) => `${summary.summary.replace(/\.$/, '')} [${i+1}].`
    ).join(" ");
    const comment = await askLlama( ollamaEndpoint, commentPrompt(text) );
    // console.log( "\n\n===== assemble prompt =====\n\n", commentPrompt(text), "\n\n==========\n\n" );
    return comment;
}

async function getCompanyName( ollamaEndpoint, comment ) {
    return askLlama( ollamaEndpoint, `Here is some company information: "${comment}". Please respond with the name of the company only. The company name is: ` );
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

async function getInfo( searchQuery, showExtraInfo = false ) {

    const page = await getWikipediaPage( searchQuery );
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
    };
}


async function main() {
    console.log("boikot assemble 🧩\nenter urls:\n");

    console.log(
        `enter ollama endpoint [ blank for ${DEFAULT_OLLAMA_ENDPOINT} ]:`
    );
    const ollamaEndpoint = await getInput() || DEFAULT_OLLAMA_ENDPOINT;
    console.log(`using ${ollamaEndpoint} as ollama endpoint\n`);

    const urls = await getUrls();
    const sources = urls.reduce(
        (res, url, i) => ({ ...res, [i+1]: url }), {}
    );

    const summaries = [];
    for( const url of urls )
        summaries.push( await summarise( ollamaEndpoint, url ) );

    const comment = await getComment( ollamaEndpoint, summaries );

    console.log( "comment:", comment );

    const companyName = await getCompanyName( ollamaEndpoint, comment );

    console.log( "companyName:", companyName );

    const { logoUrl, siteUrl } = await getInfo( companyName );
    const output = { names: [ companyName ], comment, sources, logoUrl, siteUrl };

    console.log(JSON.stringify(output, null, 4));
}

main();

