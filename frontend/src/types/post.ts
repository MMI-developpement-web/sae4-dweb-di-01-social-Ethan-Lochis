export interface PostType {
  id: number;
  TextContent: string;
  mediaUrl?: string;
  CreatedAt: string;
  Author: {
    id: number;
    username: string;
    isFollowedByCurrentUser?: boolean;
  };
  likesCount?: number;
  isLikedByCurrentUser?: boolean;
}
