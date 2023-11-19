import NewTab from "./components/NewTab";
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <NewTab />,
    children: [
      {
        path: "/:spaceId",
        element: <NewTab />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("new-root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
