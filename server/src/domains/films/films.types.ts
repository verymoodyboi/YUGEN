export interface FilmInsert {
  film_uuid: string;
  film_title: string;
  thesis: string;
  film_genre: any;
  uploader_id: string;
  country?: string;
  crew?: any;
  cast?: any;
  film_path: string;
  poster_path: string;
  film_duration: string;
  moderation_status:string;
  processing_progress: any;
   processing_step:any;

}

export type FilmUpdate = Partial<Omit<FilmInsert, 'film_uuid' | 'uploader_id'>>;
