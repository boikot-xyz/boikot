import http from "http";
import { getWikipediaInfo } from "./wiki.js";


async function getWikiInfo(req, res, state) {
    console.log(`Getting wikiInfo for ${state.names[0]}`);
    const wikiInfo = await getWikipediaInfo(state.names[0]);
    res.end(JSON.stringify(wikiInfo));
}


async function respondGet(req, res, body) {
    if( req.url == "/check" ) {
        res.end(`{"result": true}`);
        return;
    }
}

async function respondPost(req, res, body) {
    let state;
    try {
        state = JSON.parse(body);
        console.log(`Received post body: ${JSON.stringify(state)}`);
    } catch (e) {
        res.statusCode = 400;
        res.end(`{"error":"Cannot parse body json"}`);
    }

    if( req.url.includes("/wikiInfo") ) {
        return await getWikiInfo(req, res, state);
    }

    res.statusCode = 400;
    res.end(`{"error": "Bad request"}`);
}

async function respond(req, res, body) {
    console.log(`Responding to ${req.method} request to ${req.url}`);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8015");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if( req.method === "GET" ) {
        return await respondGet(req, res, body);
    }
    else if( req.method === "POST" ) {
        return await respondPost(req, res, body);
    }
    else if( req.method === "OPTIONS" ) {
        res.end();
        return;
    }
    else {
        res.statusCode = 405;
        res.end(`{"error":"METHOD_NOT_ALLOWED"}`);
        return;
    } 
}

const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (data) => {
        body += data;
    });
    req.on("end", async () => {
        return await respond(req, res, body);
    });
});

server.listen(8014, () => {
    console.log("Server running at http://localhost:8014/");
});

