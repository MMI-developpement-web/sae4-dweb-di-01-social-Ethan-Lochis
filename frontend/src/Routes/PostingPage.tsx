import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";
import { useAuth } from "../contexts/AuthContext";

export default function PostingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div data-theme="default" className="bg-bg min-h-screen">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 px-4 py-3">
        <img src="./Logo.png" alt="Kontakt logo" className="max-h-8 lg:max-h-16 w-auto" />
      </header>

      <main className="pb-24 lg:pb-0 lg:pl-56">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6 text-fg">
          <Posting onPostCreated={() => navigate('/')} />
        </div>
      </main>

      <Navbar username={user?.username || "Invité"} defaultTab="post" />
    </div>
  );
}
