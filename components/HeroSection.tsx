import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { fetchMovieImages } from "@/services/tmdb";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

// Genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Genre-based color themes
const GENRE_COLORS: Record<number, string[]> = {
  28: ["#8B0000", "#1a0a0a", "#0a0a0f"], // Action - red
  12: ["#2E7D32", "#0a1a0a", "#0a0a0f"], // Adventure - green
  16: ["#1565C0", "#0a0a1a", "#0a0a0f"], // Animation - blue
  35: ["#F9A825", "#1a1a0a", "#0a0a0f"], // Comedy - yellow
  80: ["#424242", "#1a1a1a", "#0a0a0f"], // Crime - gray
  18: ["#5D4037", "#1a0a0a", "#0a0a0f"], // Drama - brown
  10751: ["#7B1FA2", "#1a0a1a", "#0a0a0f"], // Family - purple
  14: ["#6A1B9A", "#1a0a1a", "#0a0a0f"], // Fantasy - deep purple
  27: ["#1B5E20", "#0a1a0a", "#0a0a0f"], // Horror - dark green
  9648: ["#37474F", "#0a1a1a", "#0a0a0f"], // Mystery - blue-gray
  10749: ["#C2185B", "#1a0a0a", "#0a0a0f"], // Romance - pink
  878: ["#0277BD", "#0a0a1a", "#0a0a0f"], // Sci-Fi - cyan
  53: ["#263238", "#0a0a0a", "#0a0a0f"], // Thriller - dark
  10752: ["#4E342E", "#1a0a0a", "#0a0a0f"], // War - dark brown
  37: ["#795548", "#1a1a0a", "#0a0a0f"], // Western - brown
};

const DEFAULT_COLORS = ["#1a1a2e", "#0f3460", "#0a0a0f"];

export type ContentType = "movies" | "tv" | "anime";

interface HeroSectionProps {
  movies: Movie[];
  isTV?: boolean;
  autoRotateInterval?: number;
  onColorsChange?: (colors: string[]) => void;
}

const HeroSection = ({
  movies,
  isTV = false,
  autoRotateInterval = 5000,
  onColorsChange,
}: HeroSectionProps) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { addToMyList, removeFromMyList, isInMyList, user, userData } =
    useAuth();

  const featuredMovies = movies.slice(0, 5);
  const movie = featuredMovies[currentIndex];

  // Get colors based on first genre
  const getColorsForMovie = (movie: Movie) => {
    const genreIds = (movie as any)?.genre_ids || [];
    if (genreIds.length > 0) {
      const primaryGenre = genreIds[0];
      return GENRE_COLORS[primaryGenre] || DEFAULT_COLORS;
    }
    return DEFAULT_COLORS;
  };

  // Fetch logo image from TMDB
  const fetchLogo = async (movieId: number) => {
    try {
      const data = await fetchMovieImages(movieId, isTV ? "tv" : "movie");
      const logo =
        data.logos?.find((l: any) => l.iso_639_1 === "en") || data.logos?.[0];
      if (logo) {
        setLogoUrl(`https://image.tmdb.org/t/p/w500${logo.file_path}`);
      } else {
        setLogoUrl(null);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
      setLogoUrl(null);
    }
  };

  useEffect(() => {
    if (featuredMovies.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, autoRotateInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [featuredMovies.length, autoRotateInterval]);

  useEffect(() => {
    if (movie) {
      fetchLogo(movie.id);
      const colors = getColorsForMovie(movie);
      onColorsChange?.(colors);
    }
  }, [currentIndex, movie?.id]);

  if (!featuredMovies.length || !movie) return null;

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : null;
  const title = (movie as any)?.title || (movie as any)?.name || "Unknown";
  const genres = (movie as any)?.genre_ids?.slice(0, 4) || [];
  const genreNames = genres
    .map((id: number) => GENRE_MAP[id])
    .filter(Boolean)
    .join(" • ");

  const handlePlay = () => {
    if (!movie) return;

    if (isTV) {
      router.push({
        pathname: "/tv/[id]",
        params: { id: movie.id, poster_path: movie.poster_path },
      });
    } else {
      router.push({
        pathname: "/movies/[id]",
        params: { id: movie.id, poster_path: movie.poster_path },
      });
    }
  };

  const isAdded = movie ? isInMyList(movie.id) : false;

  const handleMyList = async () => {
    if (!movie || !user) return;

    // Guest Restriction
    if (userData?.isGuest) {
      Toast.show({
        type: "error",
        text1: "Restricted",
        text2: "Verify your phone number to save content.",
      });
      return;
    }

    if (isAdded) {
      await removeFromMyList(movie.id);
    } else {
      await addToMyList(movie);
    }
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, autoRotateInterval);
  };

  return (
    <View style={styles.container}>
      {/* Card-style poster */}
      <View style={styles.posterCard}>
        {posterUrl && (
          <AnimatedImage
            sharedTransitionTag={`poster-${movie.id}`}
            source={{ uri: posterUrl }}
            style={styles.poster}
            contentFit="cover"
          />
        )}

        {/* Bottom gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />

        {/* Content overlay at bottom */}
        <View style={styles.content}>
          {/* Logo or Title - only show one */}
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* Genre tags */}
          <Text style={styles.genres}>{genreNames}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              <Image
                source={icons.play}
                style={styles.playIcon}
                tintColor="#000"
              />
              <Text style={styles.playText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listButton} onPress={handleMyList}>
              <Text style={styles.plusIcon}>{isAdded ? "✓" : "+"}</Text>
              <Text style={styles.listText}>My List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Pagination Dots - Below card */}
      {featuredMovies.length > 1 && (
        <View style={styles.dotsContainer}>
          {featuredMovies.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  posterCard: {
    width: "100%",
    aspectRatio: 2 / 2.6,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1a1a2e",
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  content: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  logoImage: {
    width: width * 0.6,
    height: 80,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
      android: {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
      web: {
        textShadow: "0px 2px 6px rgba(0,0,0,0.8)",
      },
    }),
    marginBottom: 10,
  },
  genres: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
  },
  playIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  playText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  listButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(51,51,51,0.9)",
    paddingVertical: 14,
    borderRadius: 8,
  },
  plusIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "400",
    marginRight: 8,
  },
  listText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 20,
  },
});

export default HeroSection;
