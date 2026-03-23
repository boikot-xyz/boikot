#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `

<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/Ghirardelli_Chocolate_Company" title="">Ghirardelli</a></li><li><a href="https://en.wikipedia.org/wiki/Russell_Stover_Candies" title="Russell Stover Candies">Russell Stover</a></li><li><a href="https://en.wikipedia.org/wiki/Caffarel" title="Caffarel">Caffarel</a></li><li><a href="https://en.wikipedia.org/wiki/Hofbauer" title="Hofbauer">Hofbauer</a></li><li>Küfferle</li></body></html>

`;

const tags = [
    "food",
    "confectionery",
];
const score = 38;
const ownedBy = "lindt";

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

