export interface Playlist {
  playlist_uuid: string;
  playlist_name: string;
  is_public: boolean;
  film_count: number;
  creator: {
    username: string;
    pfp_path: string;
  };
}
