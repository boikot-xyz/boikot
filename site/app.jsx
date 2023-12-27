import * as React from "react"
import ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { Router } from "./src/router.jsx";

createRoot(document.querySelector("#root")).render(<Router />);
