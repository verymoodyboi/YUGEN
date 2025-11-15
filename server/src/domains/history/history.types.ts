export interface HistoryRecord {
  film_index: number;
  watched_at: string;
  films: {
    film_uuid: string;
    film_title: string;
    film_genre: string;
    poster_path: string;
    avg_rating: number;
    thesis: string;
    view_count: number;
  };
}
