import React from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet";

import { Page, Row, Stack } from "./components.jsx";

export function ContactUs() {
    return <Page>
        <Helmet>
            <title> Contact Us | boikot </title>
            <meta name="description" content="boikot is a community-led initiative to collect and make available data on the unethical actions of big companies. Please get in touch with us if you have any questions or ideas!" />
        </Helmet>
        <Stack>
            <h1> Contact Us </h1>
            <p> We would love to hear from you with any questions,
                feedback or ideas 🙋‍♀️ please reach out and 
                we will get back to you asap.
            </p>
            <Row gap="0.5rem">
                <h3 style={{ userSelect: "none" }}> ✉️  </h3>
                <a
                    href="mailto:hello@boikot.xyz"
                    style={{ fontSize: "1.1rem", justifySelf: "left" }}>
                    hello@boikot.xyz
                </a>
            </Row>
        </Stack>
    </Page>
}


