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
    readOnly?: boolean;
  };
  likesCount?: number;
  commentsCount?: number;
  retweetsCount?: number;
  isLikedByCurrentUser?: boolean;
  isCensored?: boolean;
  isRetweet?: boolean;
  originalAuthorUsername?: string;
  OriginalPostId?: number;
  RetweetedBy?: {
    id: number;
    username: string;
    profilePicture?: string;
    readOnly?: boolean;
  };
}
