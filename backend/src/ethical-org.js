#!/usr/bin/env node

import { fetch } from 'fetch-h2';
import { URL } from 'node:url';

import { JSDOM } from "jsdom";
import esMain from 'es-main';
import { fetchOptions } from './search.js';


export async function scrapeEthicalOrg( companyName ) {
    const ethicalOrgUrl = `https://ethical.org.au/search?q=${encodeURIComponent(companyName)}`;
    const searchPageHTML = await (await fetch(ethicalOrgUrl, fetchOptions)).text();
    const searchPageDOM = new JSDOM( searchPageHTML );

    const companyLink = [...searchPageDOM.window.document.querySelectorAll("main a")].filter(a => a.href.startsWith("https://ethical.org.au/companies/"))[0];
    if(!companyLink?.href) return [];

    const pageHTML = await (await fetch(companyLink?.href, fetchOptions)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const criticism = document.querySelector("div.bg-assess-criticism");
    const information = document.querySelector("div.bg-assess-information");

    const results = [...(information?.querySelectorAll("details") || []), ...(criticism?.querySelectorAll("details") || [])].map(detail => ({
        source: "ethical.org.au",
        url: detail.querySelector("a").href,
        title: detail.querySelector("summary").textContent.trim(),
        description: detail.querySelector("div.leading-loose").textContent.trim(),
    }));

    return results;
}


