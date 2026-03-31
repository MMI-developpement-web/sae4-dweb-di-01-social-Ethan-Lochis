export interface PostType {
  id: number;
  TextContent: string;
  mediaUrl?: string;
  CreatedAt: string;
  Author: {
    id: number;
    username: string;
    profilePicture?: string;
    isFollowedByCurrentUser?: boolean;
    isReadOnly?: boolean;
  };
  likesCount?: number;
  commentsCount?: number;
  isLikedByCurrentUser?: boolean;
  isCensored?: boolean;
  isRetweet?: boolean;
  originalAuthorUsername?: string;
  RetweetedBy?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}
