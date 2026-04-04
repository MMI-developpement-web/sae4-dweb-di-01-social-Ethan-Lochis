import PostMenu from "../PostMenu";

interface PostHeaderProps {
  username: string;
  timestamp?: string;
  authorId?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostHeader({
  username,
  timestamp,
  authorId,
  onEdit,
  onDelete,
}: PostHeaderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-fg text-16 font-semibold">{username}</span>
          <span className="text-14 text-gray-400">{timestamp}</span>
        </div>
        {authorId !== undefined && (
          <PostMenu
            userId={authorId}
            username={username}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
      <span className="text-inactive text-14 ">@{username}</span>
    </div>
  );
}
