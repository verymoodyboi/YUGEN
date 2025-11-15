export interface SearchQuery {
  query: string;
  offset?: number;
  limit?: number;
}

export interface FilmResult {
  type: "film";
  title: string;
  poster?: string | null;
  uuid: string;
}

export interface AccountResult {
  type: "user";
  username: string;
  pfp?: string | null;
}

export interface PlaylistResult {
  playlist_uuid: string;
  playlist_name: string;
  is_public: boolean;
  film_count: number;
  creator: {
    username: string;
    pfp_path?: string | null;
  };
  playlist_films: {
    film_index: number;
    films: {
      film_uuid: string;
      film_title: string;
      poster_path?: string | null;
      release_date?: string | null;
      film_duration?: number | null;
      avg_rating?: number | null;
    };
  }[];
}

export interface ChallengeResult {
  type: "challenge";
  challenge_name: string;
  cover?: string | null;
  challenge_id: string;
}

export type CombinedResult = FilmResult | AccountResult | ChallengeResult;

export interface MentionResult {
  username: string;
  pfp_path?: string | null;
}

export interface AdvancedSearchParams {
  offset?: string | number;
  limit?: string | number;
  query: string;
}

