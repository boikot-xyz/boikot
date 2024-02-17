import * as React from "react"
import ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { Router } from "./router.jsx";

createRoot(document.querySelector("#react-entrypoint"))
    .render(<Router />);

