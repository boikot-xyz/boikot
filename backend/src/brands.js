#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `
<li><a href="https://en.wikipedia.org/wiki/Amana_Corporation" title="Amana Corporation">Amana</a></li>
<li><span class="noprint" style="font-size:85%; font-style: normal;"> [<a href="https://pt.wikipedia.org/wiki/Brastemp" class="extiw" title="pt:Brastemp">Brastemp</a>]</span> (Brazil)</li>
<li>Challenger (Colombia)</li>
<li>Consul (Brazil)</li>
<li>Diqua (China)</li>
<li>Estate</li>
<li>EveryDrop</li>
<li>Gladiator GarageWorks</li>
<li>Hefei Sanyo (China)<sup id="cite_ref-Rohit_31-1" class="reference"><a href="https://en.wikipedia.org/wiki/Whirlpool_Corporation#cite_note-Rohit-31"><span class="cite-bracket">[</span>31<span class="cite-bracket">]</span></a></sup></li>
<li><a href="https://en.wikipedia.org/wiki/John_Inglis_and_Company" title="John Inglis and Company">Inglis</a> (Canada and US)</li>
<li><a href="https://en.wikipedia.org/wiki/InSinkErator" title="InSinkErator">InSinkErator</a></li>
<li><a href="https://en.wikipedia.org/wiki/Jenn-Air" class="mw-redirect" title="Jenn-Air">Jenn-Air</a></li>
<li><a href="https://en.wikipedia.org/wiki/KitchenAid" title="KitchenAid">KitchenAid</a></li>
<li><span class="noprint" style="font-size:85%; font-style: normal;"> [<a href="https://fr.wikipedia.org/wiki/Laden_(marque)" class="extiw" title="fr:Laden (marque)">Laden</a>]</span> (France)</li>
<li><a href="https://en.wikipedia.org/wiki/Maytag" title="Maytag">Maytag</a></li>
<li>Polar</li>
<li>Roper</li>
<li><a href="https://en.wikipedia.org/wiki/Royalstar" title="Royalstar">Royalstar</a> (China)</li>
<li><a href="https://en.wikipedia.org/wiki/Indesit" title="Indset">Indesit</a></li>
<li><a href="https://en.wikipedia.org/wiki/Hotpoint" title="Hotpoint">Hotpoint</a></li>
<li>Stinol</li>
<li>True Fresh</li>
<li>Whirlpool</li>
<li><a href="https://en.wikipedia.org/wiki/Yummly" title="Yummly">Yummly</a></li></body></html>`;

const tags = [
    "retail",
    "electronics"
];
const score = 8;
const ownedBy = "whirlpool";

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

