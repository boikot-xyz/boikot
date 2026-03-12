#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><a href="https://en.wikipedia.org/wiki/Melvita" title="">Melvita</a></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><a href="https://en.wikipedia.org/wiki/Sol_de_Janeiro" title="Sol de Janeiro">Sol de Janeiro</a></body></html>
`;

const tags = [
    "consumer goods"
];
const score = 30;
const ownedBy = "l'occitane";

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

