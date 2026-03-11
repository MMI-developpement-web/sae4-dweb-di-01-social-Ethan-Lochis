import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./Routes/Auth";
import Home from "./Routes/Home";
import PostingPage from "./Routes/PostingPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/Auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/posting",
    element: <PostingPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
