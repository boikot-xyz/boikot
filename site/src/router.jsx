import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import { Home } from "./home.jsx";
import { CompanyEditor } from "./jsoner.jsx";
import { Companies, CompanyDetail } from "./companies.jsx";
import { Blogs, loadBlogs } from "./blog.jsx";

const router = createBrowserRouter([
    {
        path:  "/",
        element: <Home />,
    },
    {
        path:  "/companies",
        element: <Companies />,
    },
    {
        path:  "/companies/edit",
        element: <CompanyEditor />,
    },
    {
        path:  "/companies/:key",
        element: <CompanyDetail />,
        loader: ({ params }) => params,
    },
    {
        path:  "/blog",
        element: <Blogs />,
        loader: loadBlogs,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}

