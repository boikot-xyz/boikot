import { JSDOM } from "jsdom";


function unique( array ) {
    return array.filter( (item, index) => array.indexOf(item) === index );
}

export const getKey = name =>
    slugify(name).toLowerCase();


// === prompting ===

export const commentPrompt = (companyName, webpages) =>
`* You are an investigative journalist looking into the ethical track record of ${companyName}. Here is some information about ${companyName} from articles online:

    ${ webpages.map( (text, i) => 
        `* Information from source [${i+1}]:\n\n${text}`
    ).join("\n\n    ") }

* Here are some examples of succinct two-sentence company ethics summaries for other companies:

    Apple is an American technology company credited with innovation in personal computing [1] which has a generally pro-consumer stance on privacy [2][3][4] and a proactive climate policy [5][6][7]. Apple has engaged in anti-competetive practices [8], its factories have seen abusive working conditions [9][10], and its climate claims have been called misleading [11].

    Amazon is an American online retail and tech conglomerate which has funded climate change denial groups [1], issued propaganda to local news stations [2][3], sent thousands of items of unused stock to landfill [4][5], avoided billions in tax [6], violated privacy laws [7][8], discriminated against black and female employees [9][10], mistreated workers [11][12], aggressively opposed unionisation [13][14][15] and engaged in anticompetitive practices [16][17][18].
                
    Tesco is a British retailer which appropriated a UNICEF slogan for advertising purposes [1] and engaged in price fixing [2], and its supply chain has included animal cruelty [3][4], slave labour [5], and deforestation of the Amazon [6]. Tesco has provided millions of pounds in educational equipment to schools [7], which is a fraction of the amount it has avoided in tax [8].

* Please summarise the information from the online articles into a succinct two-sentence company ethics summary like those above. Make sure to include a few words on each of the major ethical infractions by the company and include information from all the sources. When you include information from each source, make sure to include its reference marker eg. [1], [2], [3] etc. Respond with the two-sentence summary only. Your summary:`;


// === web scraping ===

const getFetchOptions = url => ({
    headers: {
        "Host": (new URL(url)).hostname,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
    },
});

export async function scrape( url ) {

    const pageHTML = await (await fetch( url, getFetchOptions(url) )).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    let paragraphs = [...document.querySelectorAll("main p")];
    if( !paragraphs.length )
        paragraphs = [...document.querySelectorAll("p")];

    const text = paragraphs.map(p => p.textContent.trim()).join(" ");
    return text;
}

const searchEndpoint = searchQuery =>
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=description%7Cinfo&inprop=url&generator=prefixsearch&redirects=&gpssearch=${searchQuery}&gpsnamespace=0&gpslimit=2`;

const isNotDisambiguation = page =>
    page.description &&
    !page.description.includes("Topics referred to by the same term");

async function getWikipediaPage( searchQuery ) {

    const response = await (await fetch(
        searchEndpoint(searchQuery))
    ).json();
    // Log search results
    // console.log(JSON.stringify(response, null, 4));
    if( !response.query ) return null;
    const page = response.query.pages
        .filter(isNotDisambiguation)[0];

    return page;
}

function getLogoUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img");

    const logoUrl = logoImg?.src
        .match(/.+?\.(svg|jpg|jpeg|png)/)?.[0]
        .replace("thumb/", "")
        .replace("//upload", "https://upload");

    return logoUrl;
}

function getSiteUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox.vcard tr th.infobox-label"
    )];
    const siteLabel = infoBoxLabels.filter( 
        el => el.innerHTML.includes("Website") 
           || el.innerHTML.includes("URL")
    )[0];
    const siteUrl = siteLabel?.parentElement.querySelector("a").href;

    return siteUrl;
}

const exchanges = [
    "NYSE",
    "NASDAQ",
    "AMEX",
    "TSE",
    "LSE",
    "HKEX",
    "SSE",
    "SZSE",
    "EURONEXT",
    "JASDAQ",
    "ASX",
    "NSE",
    "BSE",
    "KBSE",
    "SGX",
    "DJIA",
    "TYO",
];


function getTickers( pageDOM ) {

    const document = pageDOM.window.document;
    const infoBoxLabels = [...document.querySelectorAll(
        "table.infobox.vcard tr th.infobox-label"
    )];
    const tradedLabel = infoBoxLabels.filter(
        el => el.innerHTML.includes("Traded")
    )[0];
    if( !tradedLabel ) return [];

    const tradedStrings = [
        ...tradedLabel.parentElement.querySelectorAll("li")
    ].map(el => el.textContent);

    const matches = unique(
        tradedStrings
        .map( s => s.match( /[ a-z]+:\s([a-z]+)/i ) )
        .filter( match => match )
        .map( match => match[1] )
    );

    if( matches.length ) return matches;

    const infoBoxes = [...document.querySelectorAll(
        "table.infobox.vcard tr"
    )];
    const tradedAsBox = infoBoxes.filter(
        el => el.textContent.includes("Traded")
    )[0];
    if( !tradedAsBox ) return [];

    return unique(
        tradedAsBox
            .textContent
            .match( /[A-Z]{2,}/g )
            .filter( s => !exchanges.includes(s) )
    );
}

export async function getInfo( searchQuery, showExtraInfo = false ) {

    const page = await getWikipediaPage( searchQuery );
    if( !page ) return { tickers: [] };

    const pageHTML = await (await fetch(page.fullurl)).text();
    const pageDOM = new JSDOM( pageHTML );

    return {
        logoUrl: getLogoUrl( pageDOM ),
        siteUrl: getSiteUrl( pageDOM ),
        tickers: getTickers( pageDOM ),
    };
}

