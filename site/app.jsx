import * as React from "react"
import ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { Home } from "./src/home.jsx";
import "./src/app.css";

createRoot(document.querySelector("#root")).render(<Home />);
