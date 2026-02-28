#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `
<ul class="mw-collapsible-content" style="margin-top: 0; margin-bottom: 0; line-height: inherit; list-style: none; margin-left: 0;"><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Berghaus" title="Berghaus">Berghaus</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Boxfresh" title="Boxfresh">Boxfresh</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Canterbury_of_New_Zealand" title="Canterbury of New Zealand">Canterbury</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Ellesse" title="Ellesse">Ellesse</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Endura_Racing" title="Endura Racing">Endura</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/KangaRoos" title="KangaRoos">KangaRoos</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Kickers_(brand)" title="">Kickers</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Lacoste" title="Lacoste">Lacoste</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Mitre_Sports_International" title="Mitre Sports International">Mitre</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Red_or_Dead" title="Red or Dead">Red or Dead</a>
</li><li style="line-height: inherit; margin: 0"> <a href="https://en.wikipedia.org/wiki/Speedo" title="Speedo">Speedo</a>
</li></ul>
`;

const tags = [
    "retail",
    "clothing",
    "sports"
];
const score = 39;
const ownedBy = "pentland-group";

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

