import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { Centerer, Header, Stack, WrappingPre } from "./components.jsx";
import boikot from "../../boikot.json";

export function Home() {
    return <Centerer>
        <Header />
        <h2> boikot is a community-led initiative to make
            data on company ethics transparent and accessible. </h2>
        <p> We are building a transparent, community-curated, freely 
            accessible collection of corporate ethics records. By 
            documenting ethical and unethical business practices, 
            we aim to inform consumer choice, raise the cost of 
            harmful business decisions, and incentivize companies to act 
            responsibly in the public interest. </p>
        <Link to="/companies"> view company records </Link>
        <Link to="/companies/edit"> get involved by adding a new company </Link>
    </Centerer>
}

