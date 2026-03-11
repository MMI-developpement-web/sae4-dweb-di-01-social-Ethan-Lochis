import Login from "../components/Login";

export default function Auth() {
  return (
    <div
      data-theme="default"
      className="bg-bg min-h-screen flex flex-col items-center justify-center gap-6 p-4"
    >
      <Login />
    </div>
  );
}