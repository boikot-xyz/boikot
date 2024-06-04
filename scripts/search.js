#!/usr/bin/env node

require("dotenv").config();
const { JSDOM } = require("jsdom");

async function askGroq( prompt ) {
    const responseJSON = await ( await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_KEY}`,
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "llama3-70b-8192",
                "temperature": 1,
                "max_tokens": 1024,
                "top_p": 1,
                "stream": false,
                "response_format": {
                    "type": "json_object"
                },
                "stop": null,
            }),
        },
    ) ).json();
    return responseJSON.choices[0].message.content;
}

async function scrape( url ) {

    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const links = [...document.querySelectorAll("a.result__link")];
    const descriptions = [...document.querySelectorAll("div.result__description")];
    return links.map( (a,i) => [
        a.textContent.trim(),
        a.href,
        // descriptions[i].textContent.trim()
    ] );
}

async function searchEcosia( company, pages=5 ) {
    return ( await Promise.all(
       ( new Array(pages) ).fill(0).map( (_,i) =>
            scrape( `https://www.ecosia.org/search?q=${company}%20unethical&p=${i}` )
        )
    ) ).flat();
}

( async () => {
    const company = process.argv[2];
    if( !company )
        process.exit(
            console.log( "error: supply company name as argument!" )
        );

    console.log( "Searching for unethical practices of", company );
    const info = await searchEcosia( company );

    const nArticles = 10;
    const prompt = 
`Imagine you are in investigative journalist looking into the ethics of ${company}. Following is a list of articles about ${company} - please select the ${nArticles} most relevant articles to read to investigate its unethical practices, and respond with their URLS in a json list.

${ info.map( ([title, url]) => title + "\n" + url ).join("\n\n") }

Please respond with the urls of the ${nArticles} most relevant articles for looking into the unethical practices of ${company}, in json format eg.:

{
    "urls": [
        "https://article1.com",
        "https://article2.com",
        ...
    ]
}

The ${nArticles} most relevant article urls are:`;

    console.log( "Getting LLM response..." );
    const response = await askGroq(prompt);

    console.log( "\n\n" );
    console.log( response );
    console.log( "\n\n" );
} )();

