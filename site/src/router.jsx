import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import { Home } from "./home.jsx";
import { ContactUs } from "./contact-us.jsx";
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
    {
        path:  "/contact-us",
        element: <ContactUs />,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}

