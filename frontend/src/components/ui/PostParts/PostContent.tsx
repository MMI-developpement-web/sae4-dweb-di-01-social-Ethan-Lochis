import { useNavigate } from "react-router-dom";
import { getMediaUrl } from "../../../lib/utils";

interface PostContentProps {
  text: string;
  mediaUrl?: string;
  isCensored?: boolean;
}

export function PostContent({ text, mediaUrl, isCensored }: PostContentProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Corps du message */}
      <p
        className={`text-16 leading-relaxed whitespace-pre-wrap break-words w-full overflow-hidden ${
          isCensored ? "text-red-400 italic" : "text-fg"
        }`}
      >
        {isCensored && <span className="mr-1">⚠️</span>}
        {text.split(/([#@]\w+)/g).map((part, index) => {
          if (part.match(/^#\w+/)) {
            return (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/search?q=${encodeURIComponent(part)}`);
                }}
                className="text-primary hover:underline cursor-pointer font-medium p-0 m-0 bg-transparent border-none appearance-none inline align-baseline"
                aria-label={`Rechercher le hashtag ${part}`}
              >
                {part}
              </button>
            );
          } else if (part.match(/^@\w+/)) {
            const username = part.substring(1);
            return (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/profile/${encodeURIComponent(username)}`);
                }}
                className="text-green-500 hover:text-green-400 hover:underline cursor-pointer font-medium p-0 m-0 bg-transparent border-none appearance-none inline align-baseline"
                aria-label={`Voir le profil de ${username}`}
              >
                {part}
              </button>
            );
          }
          return part;
        })}
      </p>

      {/* Media si présent */}
      {mediaUrl && (
        <div className="mt-2 rounded-lg overflow-hidden max-w-full inline-block">
          {mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
            <video
              src={getMediaUrl(mediaUrl) ?? undefined}
              controls
              className="max-h-96 w-auto object-contain rounded-lg"
            />
          ) : (
            <img
              src={getMediaUrl(mediaUrl) || ""}
              alt="Post media"
              className="max-h-96 w-auto object-contain rounded-lg"
            />
          )}
        </div>
      )}
    </>
  );
}
