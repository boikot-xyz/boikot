import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import { Home } from "./home.jsx";
import { ContactUs } from "./contact-us.jsx";
import { CompanyEditor } from "./jsoner.jsx";
import { Companies, CompanyDetail } from "./companies.jsx";
import { Search } from "./search.jsx";
import { StatementScore } from "./statement-score.jsx";
import { PrivacyPolicy } from "./privacy-policy.jsx";
import { TermsAndConditions } from "./terms-and-conditions.jsx";
import { Blogs, loadBlogs } from "./blog.jsx";
import { Unsubscribe } from "./unsubscribe.jsx";

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
        children: [
            {
                path: ":key",
            },
        ],
    },
    {
        path:  "/companies/:key",
        element: <CompanyDetail />,
    },
    {
        path:  "/search",
        element: <Search />,
    },
    {
        path:  "/statement-score",
        element: <StatementScore />,
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
    {
        path:  "/privacy-policy",
        element: <PrivacyPolicy />,
    },
    {
        path:  "/terms-and-conditions",
        element: <TermsAndConditions />,
    },
    {
        path:  "/unsubscribe",
        element: <Unsubscribe />,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}

