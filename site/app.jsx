import * as React from "react"
import ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { Router } from "./src/router.jsx";

createRoot(document.querySelector("#react-entrypoint"))
    .render(<Router />);

if( window.location.hostname.includes("localhost") ) {
    const script = document.createElement('script');
    script.src="https://cdn.jsdelivr.net/npm/eruda";
    document.body.append(script);
    script.onload = () => eruda.init();
}

