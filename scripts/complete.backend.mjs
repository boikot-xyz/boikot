import http from "http";
import { commentPrompt, getInfo, scrape } from "./assemble.mjs";

async function complete( state ) {
    const infoPromise = getInfo( state.names[0] );
    const webpagePromises = Object.values(state.sources).map(scrape);

    const [ info, ...webpages ] = await Promise.all([ infoPromise, ...webpagePromises ]);

    return {
        ...info,
        commentPrompt: commentPrompt( state.names[0], webpages ),
    };
}


const server = http.createServer((req, res) => {
    // This function is called once the headers have been received
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8015");

    if( req.url == "/check" && req.method == "GET" ) {
        res.end(`{"result": true}`);
        return;
    }
    if( req.method !== "POST" ) {
        res.statusCode = 405;
        res.end(`{"error":"METHOD_NOT_ALLOWED"}`);
        return;
    } 
    if( req.url !== "/complete" ) {
        res.statusCode = 404;
        res.end(`{"error":"NOT FOUND"}`);
        return;
    }

    let body = "";
    req.on("data", (data) => {
        // This function is called as chunks of body are received
        body += data;
    });
    req.on("end", () => {
        // This function is called once the body has been fully received
        let parsed;

        try {
            console.log(`::: handling: ${body}`);
            const state = JSON.parse(body);
            complete( state )
                .then( result => res.end( JSON.stringify(result) ) )
                .catch( error => console.error(error) + (res.statusCode = 400) + res.end( error.message ) );
        } catch (e) {
            res.statusCode = 400;
            res.end(`{"error":"CANNOT_PARSE"}`);
        }
    });
});

server.listen(8014, () => {
    console.log("Server running at http://localhost:8014/");
});

