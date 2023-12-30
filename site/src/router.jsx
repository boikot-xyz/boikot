import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
    useLoaderData,
} from "react-router-dom";

import { Home } from "./home.jsx";
import { Companies, Company } from "./companies.jsx";
import { Blogs, loadBlogs } from "./blog.jsx";
import { Centerer, Header } from "./components.jsx";
import boikot from "../../boikot.json";

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
        path:  "/companies/:key",
        element: <CompanyRoute />,
        loader: ({ params }) => params,
    },
    {
        path:  "/blog",
        element: <Blogs />,
        loader: loadBlogs,
    },
]);

function CompanyRoute() {
    const { key } = useLoaderData();
    return <Centerer>
        <Header />
        <Company entry={ boikot.companies[key] } />
    </Centerer>;
}

export function Router() {
    return <RouterProvider router={router} />;
}

