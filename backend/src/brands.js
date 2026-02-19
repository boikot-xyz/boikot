#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `

<a href="/wiki/Bauer_Media_Outdoor_UK" title="Bauer Media Outdoor UK">Bauer Media Outdoor UK</a><br><a href="/wiki/Black_Information_Network" title="Black Information Network">Black Information Network</a><br><a href="/wiki/Clear_Channel_Outdoor" title="Clear Channel Outdoor">Clear Channel Outdoor</a><br><a href="/wiki/Clear_Channel_UK" class="mw-redirect" title="Clear Channel UK">Clear Channel UK</a><br><a href="/wiki/Evolution_(radio_network)" title="Evolution (radio network)">Evolution</a><br><a href="/wiki/HowStuffWorks" title="HowStuffWorks">HowStuffWorks</a><br><a href="/wiki/IHeartRadio" title="IHeartRadio">iHeartRadio</a><br><a href="/wiki/Mediabase" title="Mediabase">Mediabase</a><br><a href="/wiki/Premiere_Networks" title="Premiere Networks">Premiere Networks</a><br><a href="/wiki/Radio_Computing_Services" title="Radio Computing Services">Radio Computing Services</a><br><a href="/wiki/Triton_Digital" title="Triton Digital">Triton Digital</a><br><a href="/wiki/The_Volume" title="The Volume">The Volume</a>

`;

const tags = [
    "media",
];
const score = 40;
const ownedBy = "iheartradio";

const pages = _.uniqBy(
    [...html.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)]
        .filter(m => !m[1].startsWith("#cite"))
        .filter(m => m[1].startsWith("/wiki"))
        .map(m => ["https://en.wikipedia.org"+m[1], m[2]]),
    m => m[0],
);

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

