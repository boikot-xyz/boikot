#!/usr/bin/env node

const readline = require('readline');
const { JSDOM } = require("jsdom");


async function getUrl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return await new Promise(resolve => rl.question("> ", ans => {
        rl.close();
        resolve(ans);
    }));
}

async function scrape( url ) {

    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    let paragraphs = [...document.querySelectorAll("main p")];
    if( !paragraphs.length )
        paragraphs = [...document.querySelectorAll("p")];

    const text = paragraphs.map(p => p.textContent.trim()).join(" ");
    return { text };
}

async function main() {
    console.log("enter urls:\n");

    const urls = [];
    while( true ) {
        const url = await getUrl();
        if( url ) urls.push(url);
        else break;
    }

    const scrapes = urls.map( scrape );
    const texts = await Promise.all(scrapes);
    console.log(texts);
}

main();

