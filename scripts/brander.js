#!/usr/bin/env node

const fs = require("fs");
const slugify = require("slugify");
const { JSDOM } = require("jsdom");


const searchEndpoint = searchQuery =>
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=description%7Cinfo&inprop=url&generator=prefixsearch&redirects=&gpssearch=${searchQuery}&gpsnamespace=0&gpslimit=4`;

const isNotDisambiguation = page =>
    !page?.description?.includes("Topics referred to by the same term");


const getKey = entry =>
    slugify(entry.names[0]).toLowerCase();

async function getWikipediaPage( searchQuery ) {

    const response = await (await fetch(
        searchEndpoint(searchQuery))
    ).json();
    // Log search results
    //console.log(JSON.stringify(response, null, 4));
    const page = response.query?.pages?.filter(isNotDisambiguation)?.[0];

    return page;
}

function getLogoUrl( pageDOM ) {

    const document = pageDOM.window.document;
    const logoImg =
        document.querySelector(".infobox-image.logo img") ??
        document.querySelector(".infobox-image img");

    const logoUrl = logoImg?.src
        .match(/.+?\.svg/)?.[0]
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

async function getInfo( searchQuery, showExtraInfo = false ) {

    const page = await getWikipediaPage( searchQuery );
    if( !page ) return {};
    const pageHTML = await (await fetch(page.fullurl)).text();
    const pageDOM = new JSDOM( pageHTML );

    const extraInfo = {
        searchQuery: searchQuery,
        wikipediaUrl: page.fullurl,
        wikipediaTitle: page.title,
        wikipediaDescription: page.description,
    };

    return {
        logoUrl: getLogoUrl( pageDOM ),
        siteUrl: getSiteUrl( pageDOM ),
        ...( showExtraInfo ? extraInfo : {} ),
    };
}


async function getEntry( name ) {

    const owner = "nestle";
    const score = 10;

    return {
        names: [ name ],
        comment: "",
        sources: {},
        tags: [ "food" ],
        score,
        ownedBy: [ owner ],
        ...( await getInfo(name) ),
        updatedAt: (new Date()).toISOString(),
    };
}


function toJson( entries ) {
    const result = {};

    for( const entry of entries ) {
        result[ getKey(entry) ] = entry;
    }

    return result;
}

( async function go() {
    const brandsPath = process.argv[2];

    const brands = fs.readFileSync( brandsPath, "utf-8" ).split("\n").filter(s => !!s);

    const entries = await Promise.all( brands.map( getEntry ) );
    const jsonForm = toJson( entries );

    console.log( JSON.stringify(jsonForm, null, 4) );
} )();

