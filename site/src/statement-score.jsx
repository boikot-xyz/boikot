import React from "react";
import styled from "styled-components";

import { getKey, Page, PillButton, Stack } from "./components.jsx";
import { Company } from "./companies.jsx";
import boikot from "../../boikot.json";


async function getDataURL( file ) {
    const fileReader = new FileReader();
    return new Promise( resolve => {
        fileReader.onload = e => resolve(e.target.result);
        fileReader.readAsDataURL(file);
    } );
}

async function getPageText( pdfDocument, pageNumber ) {
    const page = await pdfDocument.getPage( pageNumber );
    const textContent = await page.getTextContent();
    return textContent.items.map(
        t => t.hasEOL ? t.str + "\n" : t.str
    ).join("");
}

async function getResults( fileDataURL, setResults ) {
    setResults({ loading: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (typeof pdfjsLib === "undefined")
        alert("Could not access PDF reading utility :(");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

    const pdfDocument =
        await pdfjsLib.getDocument({ url: fileDataURL }).promise;
    const pageNumbers =
        [...Array(pdfDocument.numPages).keys()].map(x => x+1);
    const pdfText = ( await Promise.all( pageNumbers.map(
        pageNumber => getPageText( pdfDocument, pageNumber )
    ) ) ).join("\n").toLowerCase();
    const pdfWords = pdfText.split(/\s+/g);
    setResults({
        companies: Object.values(boikot.companies)
            .filter( entry => pdfWords.includes(entry.names[0].toLowerCase() ) )
            .map(getKey),
    });
}

const resultsCardStyle = {
    padding: "1rem 1rem",
    borderRadius: "2rem",
    border: "0.05rem solid var(--accent)",
    background: "var(--accent-darker)",
};

function Results({ results }) {
    if( !results ) return null;
    let content;
    if( results.loading )
        content = <h4> scanning your statement 🤔 </h4>;
    else if( !results.companies.length )
        content = <p> Unfortunately we didn't find any companies in the
            document you uploaded 😩 Please try again with
            another file? </p>;
    else
        content = <>
            <p> we found { results.companies.length } companies in your
                statement which you can read more about below. </p>
            { results.companies.map( key =>
                <Company entry={ boikot.companies[key] }
                    compact key={key} />
            ) }
        </>;
    return <Stack style={ resultsCardStyle }>
        <h2> 📊 results </h2>
        { content }
    </Stack>;
}

function PDFPreview({ src }) {
    if( !src ) return null;
    return <object  
        data={src}
        type="application/pdf"
        style={{ width: "100%", height: "60vh", borderRadius: "1rem" }} />;
}

export function StatementScore() {
    const [ fileDataURL, setFileDataURL ] = React.useState("");
    const [ results, setResults ] = React.useState(null);

    const useSample = () => setFileDataURL("/assets/boikotStatement.pdf");

    return <Page>
        <Stack>
            <h1> Statement Score </h1>
            <p> On this page you can scan a bank statment pdf against our
                companies database, to identify how ethical or
                unethical the companies you transact with are. </p>
            <p> For data protection, your bank statement will be processed
                entirely on your own device and will not be sent out via
                the internet whatsoever - you can use this page with
                airplane mode enabled. However you can also use a sample
                bank statement if you would prefer not to use
                your own. </p>
            <Results results={results} />
            <h2> scan a bank statement </h2>
            { fileDataURL && <PillButton
                onClick={() => getResults(fileDataURL, setResults)}>
                💥 click to score your statement!
            </PillButton> }
            <input type="file" accept=".pdf,application/pdf" onChange={
                async e => setFileDataURL( await getDataURL(e.target.files[0]) )
            } />
            <PDFPreview src={fileDataURL} /> 
            { fileDataURL && <PillButton
                onClick={() => getResults(fileDataURL, setResults)}>
                💥 click to score your statement!
            </PillButton> }
            { !fileDataURL && <PillButton onClick={useSample}>
                or click here to use a sample bank statement
            </PillButton> }
        </Stack>
    </Page>;
}

