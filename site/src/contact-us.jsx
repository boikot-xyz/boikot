import React from "react";
import styled from "styled-components";

import { Page, Row, Stack } from "./components.jsx";

export function ContactUs() {
    return <Page>
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


