import { motion } from "framer-motion";
import { formatTimeAgo, getMediaUrl } from "../../lib/utils";

interface CommentProps {
  id: number;
  text: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

export default function Comment({ text, authorUsername, authorAvatarUrl, createdAt }: CommentProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 pt-3 pb-2 border-l-2 border-bg-lighter ml-5 pl-4 max-w-full overflow-hidden"
    >
      <img
        src={authorAvatarUrl ? (getMediaUrl(authorAvatarUrl) || undefined) : `https://ui-avatars.com/api/?name=${authorUsername}&background=random`}
        alt={`${authorUsername}'s avatar`}
        className="size-8 rounded-full object-cover shrink-0"
      />
      <div className="flex flex-col gap-1 w-full min-w-0">
        <div className="flex justify-between items-baseline gap-2">
           <span className="text-14 font-medium text-fg truncate">{authorUsername}</span>
           <span className="text-12 text-inactive whitespace-nowrap">{formatTimeAgo(createdAt)}</span>
        </div>
        <p className="text-14 text-fg/90 whitespace-pre-wrap wrap-break-words">{text}</p>
      </div>
    </motion.article>
  );
}
