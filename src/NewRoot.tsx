import { Home, TrackTime } from "./pages";
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: ":spaceId",
        children: [{ path: "share/:windowId" }],
      },
      {
        path: "webtime",
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
