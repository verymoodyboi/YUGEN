export interface WatchlistFilm {
  film_index: number;
  films: {
    film_uuid: string;
    film_title: string;
    film_genre: string;
    poster_path: string;
    avg_rating: number;
    thesis: string;
  };
}
