import React from "react";
import styled from "styled-components";

import { Page, PillButton, Stack } from "./components.jsx";

async function getDataURL( file ) {
    const fileReader = new FileReader();
    return new Promise( resolve => {
        fileReader.onload = e => resolve(e.target.result);
        fileReader.readAsDataURL(file);
    } );
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
    return <Page>
        <Stack>
            <h1> Statement Score </h1>
            <p> On this page you can upload a bank statment pdf to have it
                scanned against our database, to identify how ethical or
                unethical the companies you transact with are. </p>
            <p> For data protection, your bank statement will be processed
                entirely on your own device and will not be sent out via the
                internet whatsoever. However you can also use a sample bank
                statement if you would prefer not to use your own! </p>
            <h2> upload a bank statement </h2>
            <input type="file" accept=".pdf,application/pdf" onChange={
                async e => setFileDataURL( await getDataURL(e.target.files[0]) )
            } />
            <PDFPreview src={fileDataURL} /> 
            { fileDataURL && <PillButton>
                💥 click to score your statement!
            </PillButton> }
            { !fileDataURL && <PillButton>
                or click here to use a sample bank statement
            </PillButton> }
        </Stack>
    </Page>;
}

