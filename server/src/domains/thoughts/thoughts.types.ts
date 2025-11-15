export interface Thought {
  id: string;
  film_uuid: string;
  auth_id: string;
  rating: number;
  comment?: string | null;
  upvotes: number;
  downvotes: number;
}

export interface ThoughtReply {
  id: string;
  thought_id: string;
  auth_id: string;
  comment: string;
}

export interface Vote {
  thought_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
}

export interface ReplyVote {
  reply_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
}

export interface AddThoughtDTO {
  film_uuid: string;
  rating: number;
  comment?: string;
}

export interface VoteDTO {
  thoughtId: string;
}

export interface ReplyDTO {
  thoughtId: string;
  comment: string;
}
