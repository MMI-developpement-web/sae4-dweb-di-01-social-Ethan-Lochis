import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./Routes/Auth";
import Home from "./Routes/Home";
import PostingPage from "./Routes/PostingPage";
import NotFound from "./Routes/NotFound";
import "./index.css";

const basename = import.meta.env.VITE_BASE?.replace(/\/$/, '') || "/~lochis1/SAE401/frontend/dist";

const router = createBrowserRouter(
  [
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
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  { basename }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
