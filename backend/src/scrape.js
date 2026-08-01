import { fetch } from 'fetch-h2';

import { JSDOM } from "jsdom";
import he from "he";


const fetchOptions = {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Sec-GPC": "1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "method": "GET",
    "mode": "cors"
};


export async function getTitle(url) {
    const pageHTML = await (await fetch(url, fetchOptions)).text();
    const title = pageHTML.match(/<title.*?>(.*?)<\/title/s);
    return he.decode(title[1].replace("\n", " ").trim());
}

