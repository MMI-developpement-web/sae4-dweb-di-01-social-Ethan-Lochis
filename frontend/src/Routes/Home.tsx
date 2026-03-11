import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";
import Post from "../components/ui/Post";

const POSTS = [
  {
    id: 1,
    username: "Alice Martin",
    text: "Première journée sur Kontakt, c'est super sympa ici ! 🎉",
    timestamp: "il y a 2 min",
  },
  {
    id: 2,
    username: "Bob Dupont",
    text: "Je viens de finir un projet React avec Tailwind CSS, franchement le combo est imbattable.",
    timestamp: "il y a 14 min",
  },
  {
    id: 3,
    username: "Clara Leroy",
    text: "Quelqu'un a des ressources pour apprendre TypeScript en profondeur ? 🤔",
    timestamp: "il y a 1h",
  },
  {
    id: 4,
    username: "David Morel",
    text: "Les composants contrôlés en React c'est vraiment puissant une fois qu'on a compris le principe.",
    timestamp: "il y a 3h",
  },
  {
    id: 5,
    username: "Emma Bernard",
    text: "Bonne nuit à tous, à demain pour de nouveaux posts ! 🌙",
    timestamp: "il y a 6h",
  },
];

export default function Home() {
  return (
    <div data-theme="default" className="bg-bg min-h-screen">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 py-3 ">
        <div>
          <img src="/Logo.png" alt="Kontakt logo" className="h-24 w-auto" />
        </div>
      </header>

      <main className="pb-20 lg:pb-0 lg:pl-56">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 text-fg">
          <div className="hidden sm:block">
            <Posting />
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-26 font-semibold my-2">Votre fil d'actualité</h1>
            {POSTS.map((post) => (
                <Post
                  username={post.username}
                  text={post.text}
                  timestamp={post.timestamp}
                />
            ))}
          </div>
        </div>
      </main>

      <Navbar username="John Doe" />
    </div>
  );
}