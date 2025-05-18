
// Define the Topic type
export type Topic = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
    };
    company: string;
    tags: string[];
    upvotes: { count: number };
    downvotes: { count: number };
    netVotes: number;
    userVoteStatus?: 'upvoted' | 'downvoted' | 'none';
    commentsCount: number;
  };