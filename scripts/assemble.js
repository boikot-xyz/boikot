#!/usr/bin/env node

const readline = require('readline');
const { JSDOM } = require("jsdom");


const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";


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

    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    let paragraphs = [...document.querySelectorAll("main p")];
    if( !paragraphs.length )
        paragraphs = [...document.querySelectorAll("p")];

    const text = paragraphs.map(p => p.textContent.trim()).join(" ");
    return text;
}

async function askLlama( ollamaEndpoint, prompt ) {
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
    `Here is some text:\n\n${text}\n\nPlease summarise that text in one succinct sentence.`;

async function summarise( ollamaEndpoint, url ) {
    const text = await scrape(url);
    const summary = await askLlama( ollamaEndpoint, summaryPrompt(text) );
    return { url, summary, text };
}

const commentPrompt = text =>
    `Here is some text:\n\n${text}\n\nPlease summarise that text in two sentences, making sure to keep the reference markers (eg. [1]).`;

async function getComment( ollamaEndpoint, summaries ) {
    const text = summaries.map(
        (summary, i) => `${summary.summary.replace(/\.$/, '')} [${i+1}].`
    ).join(" ");
    //const comment = await askLlama( ollamaEndpoint, commentPrompt(text) );
    return text;
}

async function main() {
    console.log("boikot assemble 🧩\nenter urls:\n");

    console.log(
        `enter ollama endpoint [ blank for ${DEFAULT_OLLAMA_ENDPOINT} ]:`
    );
    const ollamaEndpoint = await getInput() || DEFAULT_OLLAMA_ENDPOINT;
    console.log(`using ${ollamaEndpoint} as ollama endpoint\n`);

    const urls = await getUrls();
    const summaries = await Promise.all( urls.map(
        url => summarise( ollamaEndpoint, url )
    ) );
    const comment = await getComment( ollamaEndpoint, summaries );

    console.log(comment);
}

main();

