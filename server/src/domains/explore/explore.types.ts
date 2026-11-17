export interface Film { 
  film_uuid: string;
  film_title: string;
  thesis: string;
  film_genre: string;
  uploader_id: string;
  country?: string;
  crew?: any;
  cast?: any;
  film_path: string;
  poster_path: string;
  film_duration: string;
  embedding: number[];
}
