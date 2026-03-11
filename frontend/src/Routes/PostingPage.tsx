import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";

export default function PostingPage() {
  return (
    <div data-theme="default" className="bg-bg min-h-screen">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 px-4 py-3">
        <img src="/Logo.png" alt="Kontakt logo" className="h-24 w-auto" />
      </header>

      <main className="pb-20 lg:pb-0 lg:pl-56">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 text-fg">
          <Posting />
        </div>
      </main>

      <Navbar username="John Doe" defaultTab="post" />
    </div>
  );
}
