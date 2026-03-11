import Button from "./components/ui/Button";
import BadgeCn from "./components/ui/BadgeCn";
import Like from "./components/ui/Like";
import Publisher from "./components/ui/Publisher";
import Comment from "./components/ui/Post";
import InputField from "./components/ui/InputField";
import Login from "./components/Login";
import Navbar from "./components/ui/Navbar";
import Posting from "./components/Posting";

function app() {
  return (
    <>
      <div
        id="app"
        data-theme="default"
        className="bg-secondary text-fg flex flex-col items-center p-4 pb-20"
      >
        <h1 className="text-3xl font-bold">Les differents designs</h1>

        {/* --- Boutons --- */}
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="text-3xl font-bold"> Les Buttons</h1>
          <div className="mt-4 flex flex-col items-center gap-4">
            <Button> S'abonner </Button>
            <Button variant="secondary">Click me</Button>
            <Button variant="danger">Click me</Button>
            <Button variant="ghost">Click me</Button>
          </div>
        </div>
        {/* --- Badges --- */}
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="text-3xl font-bold"> Les Badges</h1>
          <div className="mt-4 flex flex-col items-center gap-4">
            <BadgeCn>Default</BadgeCn>
            <BadgeCn variant="success" size="lg">
              Success
            </BadgeCn>
            <BadgeCn variant="warning">Warning</BadgeCn>
            <BadgeCn variant="error">Error</BadgeCn>
          </div>
        </div>
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="mb-6 text-3xl font-bold"> Les Likes</h1>
          <Like></Like>
          <Like size="sm" />
          <Like background="grey" size="lg"></Like>
          <Like background="grey" size="lg" filling="primary"></Like>
          <Like background="primary" size="lg" filling="red"></Like>
          <Like background="primary" size="lg" filling="secondary"></Like>
        </div>
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="mb-6 text-3xl font-bold"> Les Auteurs publications</h1>
          <div className="flex flex-wrap gap-6">
            <Publisher username="Malo Reich" />
            <Publisher
              username="Denis Brognard"
              size="lg"
              ring="primary"
              avatarUrl="/Profile_p/pp.jpg"
            />
            <Publisher username="Denis Brognard" size="sm" ring="secondary" />
          </div>
        </div>
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="mb-6 text-3xl font-bold"> Les posts</h1>
          <div className="flex flex-col gap-4">
            <Comment
              username="Ethan"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla aliquet sodales magna, in blandit turpis finibus non. Vivamus a viverra lacus, ac convallis ligula. Aliquam ut viverra elit, sed efficitur mauris. Morbi varius tellus nulla, quis euismod risus blandit non. Sed nec odio ex. Sed aliquam facilisis ligula, id ultricies."
            />
            <Comment
              username="Denis"
              text="Merci !"
              isReply={true}
              timestamp="il y a 5min"
            />
          </div>
        </div>
        <div className="bg-bg m-4 w-full rounded-lg px-8 py-4">
          <h1 className="mb-6 text-3xl font-bold"> Les Champs de saisie</h1>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-sm flex-col gap-4"
          >
            <InputField variant="username" />
            <InputField variant="email" />
            <InputField variant="password" />
            <InputField variant="username" disabled />
          </form>
        </div>
        <div className="bg-bg flex max-w-sm flex-col items-center justify-center gap-4 rounded-lg p-8">
          <Login />
        </div>
        <div className="bg-bg flex w-full flex-col items-center justify-center gap-4 rounded-lg p-8 my-4">
          <Posting />
        </div>
        <Navbar />
      </div>
    </>
  );
}

export default app;
