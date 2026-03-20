#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `

<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body>uire <a href="https://en.wikipedia.org/wiki/State_Auto_Group" class="mw-redirect" title="State Auto Group">State Auto Group</a> for ov</body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body>tion of <a href="https://en.wikipedia.org/wiki/Safeco" title="Safeco">Safeco</a> Corporation in 2008. Liberty Mutual agreed to acquire all outstanding shares of Safeco for $68.25 p</body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><a href="https://en.wikipedia.org/wiki/Ironshore" title="Ironshore">Ironshore</a> (ac</body></html>
`;

const tags = [
    "insurance",
    "finance",
];
const score = 38;
const ownedBy = "liberty-mutual";

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

