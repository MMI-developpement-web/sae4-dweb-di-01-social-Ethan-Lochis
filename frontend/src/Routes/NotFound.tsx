import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div data-theme="default" className="bg-bg min-h-screen flex flex-col">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 px-4 py-3">
        <img 
          src="/Logo.png" 
          alt="Kontakt logo" 
          className="h-24 w-auto cursor-pointer" 
          onClick={() => navigate('/')}
        />
      </header>

      <main className="flex-1 pb-20 lg:pb-0 lg:pl-56 flex items-center justify-center min-h-[70vh]">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-4 text-fg text-center">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold">Page introuvable</h2>
          <p className="text-fg/70 max-w-md">
            Oups ! La page que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button type="button" variant="primary" size="md" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </main>

      <Navbar username={user?.username || "Invité"} />
    </div>
  );
}
