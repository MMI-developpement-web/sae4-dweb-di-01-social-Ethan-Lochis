import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FollowProvider } from "./contexts/FollowContext";
import { BlockProvider } from "./contexts/BlockContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Toaster } from "./components/ui/Toaster";
import { setupAPIInterceptor } from "./lib/apiInterceptor";
import Auth from "./Routes/Auth";
import Home from "./Routes/Home";
import PostingPage from "./Routes/PostingPage";
import Profile from "./Routes/Profile";
import SearchResults from "./Routes/SearchResults";
import NotFound from "./Routes/NotFound";
import "./index.css";

// Configurer l'intercepteur API au démarrage
setupAPIInterceptor();

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
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/search",
      element: <SearchResults />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <FollowProvider>
          <BlockProvider>
            <RouterProvider router={router} />
            <Toaster />
          </BlockProvider>
        </FollowProvider>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
