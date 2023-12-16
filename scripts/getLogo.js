#!/usr/bin/env node

const { JSDOM } = require("jsdom");

// document.querySelector(".infobox-image.logo img").src.match(/.+?\.svg/)[0].replace("thumb/", "");

async function getLogo(url) {

    if( !url ) return console.log("No url provided!");

    const page = await (await fetch(url)).text();
    const dom = new JSDOM(page);

    const logoImg =
        dom.window.document.querySelector(".infobox-image.logo img") ??
        dom.window.document.querySelector(".infobox-image img");

    const logoUrl = logoImg.src
        .match(/.+?\.svg/)[0]
        .replace("thumb/", "")
        .replace("//upload", "https://upload");

    console.log( logoUrl );
}

getLogo( process.argv[2] );

