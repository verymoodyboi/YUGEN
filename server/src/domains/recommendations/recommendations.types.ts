export interface Film {
  film_uuid: string;
  film_title: string;
  film_genre: string;
  poster_path: string | null;
  avg_rating: number | null;
  view_count?: number | null;
  thesis?: string | null;
  embedding?: any;
}

export interface WeekTop20Row {
  id: number;
  films: Film;
}

export interface ThoughtFilm {
  film_uuid: string;
  rating: number;
  films: {
    film_uuid: string;
    embedding: any;
    avg_rating: number | null;
  };
}
