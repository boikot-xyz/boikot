#!/usr/bin/env node

import { fetch } from 'fetch-h2';
import { URL } from 'node:url';

import { JSDOM } from "jsdom";
import esMain from 'es-main';
import { fetchOptions } from './search.js';


async function getDeepSourceUrl(url) {
    const pageHTML = await (await fetch(url, fetchOptions)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const links = [...document.querySelectorAll("a")].filter(l => l.textContent === "(click here)");
    return links[0]?.href || url;
}



const slice = a => [a[0], a[3], a[6]];
export async function scrapeViolations( violationsUrl, source ) {
    const pageHTML = await (await fetch(violationsUrl, fetchOptions)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const data = [...document.querySelectorAll("tbody tr")].map(el => ({
        source,
        url: el.querySelector("a").href.replace(/^\/\//, "https://"),
        title: slice([...el.querySelectorAll("td")].map(el => el.textContent)).join(" - "),
        description: [...el.querySelectorAll("td")].map(el => el.textContent).join("; ").replace("; ", "; Parent company "),
    })).slice(0,20);
    const deepData = await Promise.all(data.map(async d => ({
        ...d,
        url: await getDeepSourceUrl(d.url),
    })));
    return deepData;
}

export async function scrapeViolationTrackers( companyName ) {
    return {
        violations: await scrapeViolations(`https://violationtracker.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`, "violation tracker"),
        violationsUk: await scrapeViolations(`https://violationtrackeruk.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`, "violation tracker uk"),
        violationsGlobal: await scrapeViolations(`https://violationtrackerglobal.goodjobsfirst.org/?company_op=starts&company=${encodeURIComponent(companyName)}`, "violation tracker global"),
    };
}

