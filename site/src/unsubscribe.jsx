import React from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet";

import { Page, Row, Stack, PillButton, isEmail } from "./components.jsx";

export function Unsubscribe() {
    const [ email, setEmail ] = React.useState("");

    return <Page>
        <Helmet>
            <title> Unsubscribe | boikot </title>
            <meta name="description" content="boikot is a community-led initiative to collect and make available data on the unethical actions of big companies. Please get in touch with us if you have any questions or ideas!" />
        </Helmet>
        <Stack>
            <h1> Unsubscribe </h1>
            <p> Enter your email below to unsubscribe
                from our mailing list. We're sad to lose you
                from our community!!
            </p>
            <form name="unsubscribe" method="post">
                <input type="hidden" name="form-name"
                    value="unsubscribe" />
                <Row style={{
                    width: "100%",
                    gridTemplateColumns: "1fr max-content"
                }}>
                    <input type="email" name="email"
                        placeholder="enter your email"
                        value={ email }
                        style={{ 
                            borderColor: !!email.length
                                && !isEmail(email) && "red",
                            minWidth: 0
                        }}
                        onChange={ e =>
                            setEmail(e.target.value) }/>
                    <PillButton type="submit"
                        disabled={ !isEmail(email) }>
                        submit  📨
                    </PillButton>
                </Row>
            </form>
        </Stack>
    </Page>
}



