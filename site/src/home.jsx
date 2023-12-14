import React from "react";
import { tojson, Jsoner } from "./jsoner.jsx";
import boikot from "../../boikot.json";



export function Home() {
    return <div style={{ padding: "2rem", maxWidth: "50rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>boikot 🙅‍♀️ </h1>
        <Jsoner/>
        <pre style={{ whiteSpace: "pre-wrap" }}>
            { tojson(boikot) }
        </pre>
    </div>;
}

