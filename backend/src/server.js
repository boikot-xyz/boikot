import http from "http";
import { getWikipediaInfo } from "./wiki.js";
import { askLocalGPTOSS } from "./llm.js";
import { addRecord } from "./addRecord.js";
import boikot from "../../boikot.json" with { type: "json" };


async function getWikiInfo(req, res, state) {
    console.log(`Getting wikiInfo for ${state.names[0]}`);
    const wikiInfo = await getWikipediaInfo(state.names[0]);
    console.log(`Returning wikiInfo: ${JSON.stringify(wikiInfo)}`);
    res.end(JSON.stringify(wikiInfo));
}


function generateCommentPrompt( state ) {
    const companyName = state.names[0];
    const sourceInfo = Object.entries(state.sourceNotes).map( ([ key, note ]) =>
        `Source [${key}]: ${note}`
    ).join("\n");

    return `
You are an investigative journalist looking into the ethical track record of ${companyName}. You have collected some information about the company and now your task is to compile the information into a two-sentence company ethics report that can be published online.

Here are some examples of two-sentence company ethics reports you have written in the past:

- ${boikot.companies.apple.comment}

- ${boikot.companies.bbc.comment}

Below is the information you have collected about ${companyName} from various sources.

${sourceInfo}

Please summarise this information into a two-sentence summary of the ethics of ${companyName}, like the examples above.
- Begin with "${companyName} is a " and mention the country the company comes from
- Only use the information above in your summary.
- Make sure you include information from all the sources.
- After you include information from a given source, include its citation number eg. [1], [2] or [3].
- Our citation engine is not that smart, so if you want to add 2 citiations together, do it like this: [4][5], not like this: [4, 5].
- Keep your summary succinct like the examples.
- Don't include positive statements about the company that aren't related to specifically ethical actions.
- Respond with your two-sentence ethics summary only and no other text.
    `;
}


async function generateComment(req, res, state) {
    console.log(`Generating comment for ${state.names[0]}`);
    const comment = await askLocalGPTOSS( generateCommentPrompt(state) );
    console.log(`Returning comment: ${comment}`);
    res.end(JSON.stringify({ comment }));
}


async function saveCompanyData(req, res, state) {
    console.log(`Saving company data for ${state.names[0]}`);
    addRecord( state );
    console.log(`Saved company data`);
    res.end(JSON.stringify({ message: "saved ok!" }));
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

    if( req.url.includes("/generateComment") ) {
        return await generateComment(req, res, state);
    }

    if( req.url.includes("/saveCompanyData") ) {
        return await saveCompanyData(req, res, state);
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

