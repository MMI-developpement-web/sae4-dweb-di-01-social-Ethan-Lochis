import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FollowProvider } from "./contexts/FollowContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Toaster } from "./components/ui/Toaster";
import { setupAPIInterceptor } from "./lib/apiInterceptor";
import Auth from "./Routes/Auth";
import Home from "./Routes/Home";
import PostingPage from "./Routes/PostingPage";
import Profile from "./Routes/Profile";
import NotFound from "./Routes/NotFound";
import "./index.css";

// Configurer l'intercepteur API au démarrage
setupAPIInterceptor();

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
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
], {
  // Cette ligne est LA clé : elle récupère le chemin que tu passeras au build
  basename: import.meta.env.BASE_URL 
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <FollowProvider>
          <RouterProvider router={router} />
          <Toaster />
        </FollowProvider>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
