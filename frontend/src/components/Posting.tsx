import { useState } from "react";
import Publisher from "./ui/Publisher";
import Button from "./ui/Button";

export default function Posting() {
  const [content, setContent] = useState("");

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: send post to API
    setContent("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 rounded-[5px] shadow-2xl bg-bg-lighter w-full max-w-2xl mx-auto"
    >
      <Publisher username="John Doe" size="md" />
      <textarea
        id="post-text"
        name="post-text"
        value={content}
        onChange={handleContentChange}
        placeholder="What's on your mind?"
        rows={8}
        className="shrink w-full resize-none rounded-lg border border-fg p-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={content.trim().length === 0}
        >
          Publier
        </Button>
      </div>
    </form>
  );
}

