#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `


<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/Le_M%C3%A9ridien" title="Le Méridien">Le Méridien</a></li>
<li><a href="https://en.wikipedia.org/wiki/The_Ritz-Carlton_Hotel_Company" title="The Ritz-Carlton Hotel Company">Ritz-Carlton Hotels</a></li>
<li><a href="https://en.wikipedia.org/wiki/Sheraton_Hotels_and_Resorts" title="Sheraton Hotels and Resorts">Sheraton Hotels</a></li>
<li><a href="https://en.wikipedia.org/wiki/Westin_Hotels_%26_Resorts" title="Westin Hotels &amp; Resorts">Westin Hotels &amp; Resorts</a></li></body></html>

`;

const tags = [
    "hospitality",
];
const score = 22;
const ownedBy = "Marriott";

const pages = _.uniqBy(
    [...html.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)]
        .filter(m => !m[1].includes("#cite"))
        .filter(m => m[1].includes("/wiki"))
        .map(m => [m[1], m[2]]),
    m => m[0],
);
console.log(pages);

export const getKey = name => slugify(name).toLowerCase();
const entries = {};

for( const [url, name] of pages ) {
    console.log(name)
    const entry = {
        "names": [
            name,
        ],
        "comment": "",
        "sources": {},
        "sourceNotes": {},
        "tags": tags,
        "score": score,
        "ownedBy": [
            ownedBy,
        ],
        "updatedAt": (new Date()).toISOString(),
        ...(await getWikipediaInfo(name, url)),
    };
    entries[getKey(name)] = entry;
}

console.log(JSON.stringify(entries, null, 4));

