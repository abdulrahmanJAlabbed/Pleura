/**
 * TMDB API Service
 * Handles all interactions with The Movie Database API
 */

// TMDB API access token from environment variables
const TMDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;

if (!TMDB_ACCESS_TOKEN) {
  console.warn(
    "⚠️ TMDB API token is missing! Copy .env.example to .env and add your TMDB credentials.",
  );
}

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  ACCESS_TOKEN: TMDB_ACCESS_TOKEN || "",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
};

/**
 * Streaming server URL configurations
 */
export const STREAMING_SERVERS = {
  autoembed: (id: number) => `https://player.autoembed.cc/embed/movie/${id}`,
  vidsrc: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
  twoembed: (id: number) => `https://www.2embed.cc/embed/${id}`,
  superembed: (id: number) =>
    `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  smashystream: (id: number) => `https://player.smashy.stream/movie/${id}`,
};

export const SERVER_NAMES: Record<keyof typeof STREAMING_SERVERS, string> = {
  autoembed: "AutoEmbed",
  vidsrc: "VidSrc",
  twoembed: "2Embed",
  superembed: "SuperEmbed",
  smashystream: "SmashyStream",
};

/**
 * Get full image URL from TMDB path
 */
export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500",
): string | null => {
  if (!path) return null;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Search movies by query string
 */
export const searchMovies = async (
  query: string,
  page: number = 1,
): Promise<PaginatedResponse> => {
  if (!query.trim()) return { results: [], totalResults: 0, totalPages: 0 };

  const url = `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching movies:", error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

/**
 * Search TV shows by query string
 */
export const searchTV = async (
  query: string,
  page: number = 1,
): Promise<PaginatedResponse> => {
  if (!query.trim()) return { results: [], totalResults: 0, totalPages: 0 };

  const url = `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}&include_adult=false&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching TV:", error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

/**
 * Search Multi (Movies + TV)
 */
export const searchMulti = async (
  query: string,
  page: number = 1,
): Promise<PaginatedResponse> => {
  if (!query.trim()) return { results: [], totalResults: 0, totalPages: 0 };

  const url = `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);

    const data = await response.json();
    return {
      results:
        data.results?.filter(
          (i: any) => i.media_type === "movie" || i.media_type === "tv",
        ) || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching multi:", error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

/**
 * Get movie details by ID
 */
export const fetchMovieDetails = async (
  movieId: number,
): Promise<MovieDetails> => {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

/**
 * Get movie credits (cast and crew)
 */
export const fetchMovieCredits = async (
  movieId: number,
): Promise<{ cast: CastMember[]; crew: CrewMember[] }> => {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      cast: data.cast?.slice(0, 10) || [],
      crew: data.crew || [],
    };
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    throw error;
  }
};

/**
 * Get movie videos (trailers)
 */
export const fetchMovieVideos = async (
  movieId: number,
): Promise<MovieVideo[]> => {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    throw error;
  }
};

/**
 * Get YouTube trailer URL from video list
 */
export const getTrailerUrl = (videos: MovieVideo[]): string | null => {
  const trailer = videos.find(
    (v) =>
      v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

/**
 * Fetch movies by genre ID
 */
export const fetchMoviesByGenre = async (
  genreId: number,
  page: number = 1,
): Promise<Movie[]> => {
  const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&vote_average.gte=4`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    throw error;
  }
};

/**
 * Fetch recommended movies for a movie (with fallback to similar movies)
 */
export const fetchRecommendedMovies = async (
  movieId: number,
): Promise<Movie[]> => {
  const headers = {
    Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
    accept: "application/json",
  };

  try {
    // Try recommendations first
    const recUrl = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/recommendations?language=en-US&page=1`;
    const recResponse = await fetch(recUrl, { method: "GET", headers });

    if (recResponse.ok) {
      const recData = await recResponse.json();
      const recommendations = recData.results?.filter(
        (m: Movie) => m.poster_path,
      );
      if (recommendations && recommendations.length > 0) {
        return recommendations.slice(0, 10);
      }
    }

    // Fallback to similar movies
    const simUrl = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`;
    const simResponse = await fetch(simUrl, { method: "GET", headers });

    if (simResponse.ok) {
      const simData = await simResponse.json();
      const similar = simData.results?.filter((m: Movie) => m.poster_path);
      return similar?.slice(0, 10) || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Get TV show details by ID
 */
export const fetchTVDetails = async (tvId: number): Promise<TVDetails> => {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
      // Append credits and similar to minimize requests
      // Note: fetch doesn't support params object like axios, need to append to url
    });
    // Re-doing url with params
    const urlWithParams = `${url}?append_to_response=credits,recommendations,similar&language=en-US`;

    const res = await fetch(urlWithParams, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching TV details:", error);
    throw error;
  }
};

/**
 * Get TV season details
 */
export const fetchSeasonDetails = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeasonDetails> => {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Season ${seasonNumber} details:`, error);
    throw error;
  }
};

/**
 * Get TV credits (cast and crew)
 */
export const fetchTVCredits = async (
  tvId: number,
): Promise<{ cast: CastMember[]; crew: CrewMember[] }> => {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/credits?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      cast: data.cast?.slice(0, 10) || [],
      crew: data.crew || [],
    };
  } catch (error) {
    console.error("Error fetching TV credits:", error);
    throw error;
  }
};

/**
 * Get TV videos (trailers)
 */
export const getTVVideos = async (tvId: number): Promise<MovieVideo[]> => {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/videos?language=en-US`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching TV videos:", error);
    throw error;
  }
};

/**
 * Fetch recommended TV shows
 */
export const fetchTVRecommendations = async (
  tvId: number,
): Promise<Movie[]> => {
  const headers = {
    Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
    accept: "application/json",
  };

  try {
    // Try recommendations first
    const recUrl = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/recommendations?language=en-US&page=1`;
    const recResponse = await fetch(recUrl, { method: "GET", headers });

    if (recResponse.ok) {
      const recData = await recResponse.json();
      const recommendations = recData.results?.filter(
        (m: Movie) => m.poster_path,
      );
      if (recommendations && recommendations.length > 0) {
        return recommendations.slice(0, 10);
      }
    }

    // Fallback to similar TV shows
    const simUrl = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/similar?language=en-US&page=1`;
    const simResponse = await fetch(simUrl, { method: "GET", headers });

    if (simResponse.ok) {
      const simData = await simResponse.json();
      const similar = simData.results?.filter((m: Movie) => m.poster_path);
      return similar?.slice(0, 10) || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching recommended TV shows:", error);
    return [];
  }
};

// ============================================
// HOME PAGE API FUNCTIONS
// ============================================

export type MediaType = "movie" | "tv";

export interface PaginatedResponse {
  results: Movie[];
  totalResults: number;
  totalPages: number;
}

const fetchFromTMDB = async (endpoint: string): Promise<PaginatedResponse> => {
  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });
    if (!response.ok) return { results: [], totalResults: 0, totalPages: 0 };
    const data = await response.json();
    return {
      results: data.results?.filter((m: any) => m.poster_path) || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

/**
 * Fetch trending movies or TV shows
 */
export const fetchTrending = async (
  type: MediaType = "movie",
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(`/trending/${type}/week?language=en-US`);
};

/**
 * Fetch now playing movies
 */
export const fetchNowPlaying = async (
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(`/movie/now_playing?language=en-US&page=${page}`);
};

/**
 * Fetch top rated movies or TV shows
 */
export const fetchTopRated = async (
  type: MediaType = "movie",
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(`/${type}/top_rated?language=en-US&page=${page}`);
};

/**
 * Fetch popular movies or TV shows
 */
export const fetchPopular = async (
  type: MediaType = "movie",
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(`/${type}/popular?language=en-US&page=${page}`);
};

/**
 * Fetch currently airing TV shows
 */
export const fetchOnTheAir = async (
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(`/tv/on_the_air?language=en-US&page=${page}`);
};

/**
 * Fetch anime (TV shows with animation genre)
 */
export const fetchAnime = async (
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(
    `/discover/tv?with_genres=16&sort_by=popularity.desc&vote_average.gte=4&page=${page}`,
  );
};

/**
 * Fetch anime movies
 */
export const fetchAnimeMovies = async (
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(
    `/discover/movie?with_genres=16&sort_by=popularity.desc&vote_average.gte=4&with_release_type=3|4&page=${page}`,
  );
};

/**
 * Fetch top rated anime
 */
export const fetchTopRatedAnime = async (
  page: number = 1,
): Promise<PaginatedResponse> => {
  return fetchFromTMDB(
    `/discover/tv?with_genres=16&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`,
  );
};

/**
 * Production company IDs for filtering
 */
export const PRODUCTION_COMPANIES = {
  netflix: { id: 213, name: "Netflix", logo: "🔴" },
  disney: { id: 2, name: "Disney", logo: "🏰" },
  marvel: { id: 420, name: "Marvel", logo: "🦸" },
  pixar: { id: 3, name: "Pixar", logo: "🎈" },
  warner: { id: 174, name: "Warner Bros", logo: "🎬" },
  universal: { id: 33, name: "Universal", logo: "🌍" },
};

/**
 * Fetch movies by production company with pagination
 */
export const fetchByCompanyPaginated = async (
  companyId: number,
  page: number = 1,
): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> => {
  const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?with_companies=${companyId}&sort_by=popularity.desc&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalPages: data.total_pages || 1,
      totalResults: data.total_results || 0,
    };
  } catch (error) {
    console.error("Error fetching by company:", error);
    return { results: [], totalPages: 1, totalResults: 0 };
  }
};

/**
 * Fetch movies by production company (simple, first page only)
 */
export const fetchByCompany = async (companyId: number): Promise<Movie[]> => {
  const data = await fetchFromTMDB(
    `/discover/movie?with_companies=${companyId}&sort_by=popularity.desc&page=1`,
  );
  return data.results;
};

/**
 * Fetch movies from a TMDB list with pagination
 */
export const fetchList = async (
  listId: number | string,
  page: number = 1,
): Promise<PaginatedResponse> => {
  const url = `${TMDB_CONFIG.BASE_URL}/list/${listId}?language=en-US&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.items?.filter((m: any) => m.poster_path) || [],
      totalPages: Math.ceil(
        (data.total_results || data.items?.length || 0) / 20,
      ),
      totalResults: data.total_results || data.items?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching list:", error);
    return { results: [], totalPages: 1, totalResults: 0 };
  }
};

/**
 * Fetch TV shows by genre
 */
export const fetchTVByGenre = async (genreId: number): Promise<Movie[]> => {
  const data = await fetchFromTMDB(
    `/discover/tv?with_genres=${genreId}&sort_by=popularity.desc&page=1`,
  );
  return data.results;
};

/**
 * Discover movies with advanced filtering
 */
/**
 * Discover movies with advanced filtering
 */
export const discoverMovies = async (params: {
  with_genres?: string | number;
  with_companies?: string | number;
  sort_by?: string;
  page?: number;
}): Promise<PaginatedResponse> => {
  const queryParams = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    include_video: "false",
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || "popularity.desc",
    ...(params.with_genres && { with_genres: params.with_genres.toString() }),
    ...(params.with_companies && {
      with_companies: params.with_companies.toString(),
    }),
  });

  const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error discovering movies:", error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

/**
 * Discover TV shows with advanced filtering
 */
export const discoverTV = async (params: {
  with_genres?: string | number;
  with_companies?: string | number;
  sort_by?: string;
  with_keywords?: string;
  page?: number;
}): Promise<PaginatedResponse> => {
  const queryParams = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    include_null_first_air_dates: "false",
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || "popularity.desc",
    ...(params.with_genres && { with_genres: params.with_genres.toString() }),
    ...(params.with_companies && {
      with_companies: params.with_companies.toString(),
    }),
    ...(params.with_keywords && {
      with_keywords: params.with_keywords.toString(),
    }),
  });

  const url = `${TMDB_CONFIG.BASE_URL}/discover/tv?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.total_results || 0,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error discovering TV:", error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
};

export interface ImageObject {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface MovieImages {
  backdrops: ImageObject[];
  logos: ImageObject[];
  posters: ImageObject[];
}

/**
 * Fetch movie or TV show images (logos, backdrops, posters)
 */
export const fetchMovieImages = async (
  id: number,
  type: MediaType = "movie",
): Promise<MovieImages> => {
  const url = `${TMDB_CONFIG.BASE_URL}/${type}/${id}/images?include_image_language=en,null`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching images:", error);
    return { backdrops: [], logos: [], posters: [] };
  }
};
