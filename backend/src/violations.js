#!/usr/bin/env node

import { fetch } from 'fetch-h2';
import { URL } from 'node:url';

import { JSDOM } from "jsdom";
import esMain from 'es-main';
import { fetchOptions } from './search.js';


const slice = a => [a[0], a[3], a[6]];
export async function scrapeViolations( violationsUrl, source ) {
    const pageHTML = await (await fetch(violationsUrl, fetchOptions)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const data = [...document.querySelectorAll("tbody tr")].map(el => ({
        source,
        url: el.querySelector("a").href,
        title: slice([...el.querySelectorAll("td")].map(el => el.textContent)).join(" - "),
        description: [...el.querySelectorAll("td")].map(el => el.textContent).join("; ").replace("; ", "; Parent company "),
    }));
    return data;
}

export async function scrapeViolationTrackers( companyName ) {
    return {
        violations: await scrapeViolations(`https://violationtracker.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`, "violation tracker"),
        violationsUk: await scrapeViolations(`https://violationtrackeruk.goodjobsfirst.org/?company=${encodeURIComponent(companyName)}`, "violation tracker uk"),
        violationsGlobal: await scrapeViolations(`https://violationtrackerglobal.goodjobsfirst.org/?company_op=starts&company=${encodeURIComponent(companyName)}`, "violation tracker global"),
    };
}

