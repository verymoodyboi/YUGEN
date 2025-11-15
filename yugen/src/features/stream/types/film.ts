export interface Film {
  film_uuid: string;
  film_title: string;
  film_genre?: string;
  poster_path: string;
  uploader_id: string;
  view_count?: number;
  avg_rating?: number;
  thesis?: string;
  updated_at?:any;
}
