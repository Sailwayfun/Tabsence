import NewTab from "./components/NewTab";
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import TrackTime from "./components/TrackTime";

const router = createHashRouter([
  {
    path: "/",
    element: <NewTab />,
    children: [
      {
        path: "/:spaceId",
      },
      {
        path: "/webtime",
        element: <TrackTime />,
        children: [
          {
            path: ":date",
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("new-root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
