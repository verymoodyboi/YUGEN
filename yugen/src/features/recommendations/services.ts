import { api } from "../../lib/api";


export const fetchHotThisWeek = async (offset = 0, limit = 10) => {
  const res = await api.get("/recommendations/hotThisWeek", {
    params: { offset, limit },
  });
  return res.data;
};

export const fetchRecommended = async (
  user_id: string,
  offset = 0,
  limit = 10
) => {
  const res = await api.get("/recommendations/personalized", {
    params: { user_id, offset, limit },
  });
  return res.data;
};


export const fetchFilmsByGenre = async (
  genre: string,
  offset = 0,
  limit = 100
) => {
  const res = await api.get("/recommendations/films-by-genre", {
    params: { genre, offset, limit },
  });
  return res.data;
};


export const fetchAllGenres = async () => {
  const res = await api.get("/recommendations/genres");
  return res.data;
};


export async function getHomeRecommendations(userId?: string) {
  try {
    const response = await api.get("/recommendations/home", {
      params: { userId },
    });

    return (
      response.data ?? {
        hottest: [],
        fresh: [],
        subscriptions: [],
        watchlist: [],
        community: [],
      }
    );
  } catch (error) {
    console.error("Failed to load recommendations:", error);
    return {
      hottest: [],
      fresh: [],
      subscriptions: [],
      watchlist: [],
      community: [],
    };
  }
}


export async function getSimilarFilms(filmId: string) {
  try {
    const res = await api.get("/recommendations/similar", {
      params: { filmId },
    });

    console.log("found:", res.data);

    return res.data?.films ?? [];
  } catch (err) {
    console.error("Failed to fetch similar films", err);
    return [];
  }
}


export async function fetchLatestUserFilms({
  pageParam = 0,
  uploaderID,
}: {
  pageParam?: number;
  uploaderID: string;
}) {
  const res = await api.get("/view_profile/latest-profile", {
    params: { offset: pageParam, limit: 10, uploaderID },
  });
  return res.data;
}

export async function fetchProfileFilms({
  offset = 0,
  limit = 10,
  uploaderID,
}: {
  offset?: number;
  limit?: number;
  uploaderID: string;
}) {
  const res = await api.get("/view_profile/latest-profile", {
    params: { offset, limit, uploaderID },
  });
  return res.data;
}


export default {
  fetchHotThisWeek,
  fetchRecommended,
  fetchFilmsByGenre,
  fetchAllGenres,
  getHomeRecommendations,
  getSimilarFilms,
  fetchLatestUserFilms,
  fetchProfileFilms,
};
