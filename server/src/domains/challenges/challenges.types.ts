export interface UserSummary {
  auth_id?: string;
  role?: string;
  username?: string;
  pfp_path?: string | null;
  academic_status?: string | null;
}

export interface Challenge {
  challenge_id?: string;
  challenge_name?: string | null;
  challenge_discription?: string | null;
  creator_id?: string | null;
  end_date?: string | null;
  cover_path?: string | null;
  challenge_rules?: any[] | null;
  film_count?: number | null;
  vote_count?: number | null;
  deadline?: string | null;
  is_academic?: boolean | null;
  allow_non_students?: boolean | null;
  university_name?: string | null;
  ranking_system?: string | null;
  podium?: any | null;
  creator?: UserSummary | null;
}

export interface FilmSummary {
  film_uuid: string;
  film_title?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
  avg_rating?: number | null;
  uploader_id?: string | null;
}

export interface PodiumItem {
  film_uuid: string;
  rank: number;
  [key: string]: any;
}

export interface CreateChallengeDTO {
  challenge_name: string;
  challenge_discription?: string;
  challenge_rules?: string; // JSON string
  is_academic: "true" | "false";
  allowNonStudents: "true" | "false";
  uniName?: string;
  deadline?: string;
  rankingSystem?: string;
  podium?: any;
}
export interface EditChallengeDTO {
  deadlineExtension?: any | null;
  rules?: string[] | null;
}
