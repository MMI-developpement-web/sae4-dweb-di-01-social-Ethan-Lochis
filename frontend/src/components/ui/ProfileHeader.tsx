import Publisher from "./Publisher";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  postCount: number;
  followingCount: number;
  followerCount: number;
}

export default function ProfileHeader({
  username,
  avatarUrl,
  postCount,
  followingCount,
  followerCount,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-6 bg-bg-lighter text-fg">
      <Publisher username={username} avatarUrl={avatarUrl} size="lg" ring="default" />

      <div className="flex w-full max-w-sm justify-between text-center mt-4">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-fg">{postCount}</span>
          <span className="text-sm font-medium ">Posts</span>
        </div>
        <div className="flex flex-col items-center flex-1 border-x border-gray-200">
          <span className="text-xl font-bold text-fg">{followingCount}</span>
          <span className="text-sm font-medium ">Abonnements</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-fg">{followerCount}</span>
          <span className="text-sm font-medium ">Abonnés</span>
        </div>
      </div>
    </div>
  );
}