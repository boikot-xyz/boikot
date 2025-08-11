#!/usr/bin/env node

import { JSDOM, VirtualConsole } from 'jsdom';
import { promises as fs } from 'fs';
import path from 'path';

const virtualConsole = new VirtualConsole();
// virtualConsole.on("error", () => {});
virtualConsole.on("warn", () => {});
virtualConsole.on("info", () => {});
virtualConsole.on("dir", () => {});

const visitedUrls = {};

async function scrape( url ) {
    
    const pageHTML = await (await fetch(url)).text();
    const pageDOM = new JSDOM(
        pageHTML, {
            runScripts: "dangerously",
            resources: "usable",
            url: url,
            referrer: url,
            contentType: "text/html",
            includeNodeLocations: true,
            storageQuota: 10000000,
            virtualConsole,
        }
    );
    return new Promise( resolve =>
        pageDOM.window.renderCallback = () => resolve(pageDOM.serialize())
    );
}

async function renderTree( url, targetDir=null ) {

    if( visitedUrls[url.pathname] ) return;
    visitedUrls[url.pathname] = true;

    let filePath = (targetDir || url.host)
        + url.pathname.replace( /\/?(index.html)?$/, "/index.html" ); 

    console.log( "Rendering", url.toString(), "to", filePath );

    let text;
    try {
        text = await scrape( url );
        if( !text ) return;
    } catch(error) {
        console.error(error);
        return;
    }

    await fs.mkdir( path.dirname(filePath), { recursive: true } );
    await fs.writeFile( filePath, text );

    const origin = ( new URL(url) ).origin;
    const urls = 
        [...text.matchAll(/<a.+?href=\"([^\"]+)\".+?<\/a>/g)]
            .map( match => match[1] )
            .map( path => new URL(path, origin) )
            .filter( otherUrl => otherUrl.origin === origin )
            .filter( otherUrl =>
                !otherUrl.pathname.match(/companies\/edit\/./)
            )
            .map( otherUrl =>
                new URL(otherUrl.pathname, otherUrl.origin)
            );
    for( const otherUrl of urls )
        await renderTree( otherUrl, targetDir );
}


( async () => {
    await renderTree( new URL(process.argv[2]), process.argv[3] );
    console.log( "\n Finished rendering", process.argv[2] );
} )();

