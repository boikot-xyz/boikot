#!/usr/bin/env node

const { JSDOM } = require("jsdom");

// "https://www.bbc.co.uk/news/uk-67972796"
// "https://uk.finance.yahoo.com/news/barclays-share-price-plummeted-6-161400453.html?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvLnVrLw&guce_referrer_sig=AQAAAND0Vxno_XUzjaC0MXOV4h6hBfpsUAP-aB7qKao9JudPxCEGxzeIVtSJw1HlNHBc7SbtJKtOigH5GtyIFlKGMRvOpJK4nA6ZQm0LOE960JO5Pcah2POYOM2aq4aLXyHolOKUbpdLPm2ANRm8aj_83f9zqpc-LsksEiL1xQujOpJ6"
// "https://news.sky.com/story/more-attacks-in-red-sea-if-uk-didnt-act-says-david-cameron-as-he-defends-military-action-13048021"

async function scrape( url, main=true ) {

    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;
    const paragraphs = [...document.querySelectorAll(`${main ? "main " : ""}p`)];
    const text = paragraphs.map(p => p.textContent.trim()).join(" ");

    if( main && !text ) return await scrape(url, false);

    return { text };
}

( async () => {
    const info = await scrape( process.argv[2] );
    console.log(
        "\n\n\n\n",
        JSON.stringify(info, null, 2),
        "\n\n\n\n"
    );
} )();

