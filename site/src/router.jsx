import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import { Home } from "./home.jsx";

const router = createBrowserRouter([
    {
        path:  "/",
        element: <Home />,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}

