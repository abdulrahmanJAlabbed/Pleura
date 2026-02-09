import CastCard from "@/components/CastCard";
import CommentSection from "@/components/CommentSection";
import EmbedPlayer from "@/components/EmbedPlayer";
import ServerSelector from "@/components/ServerSelector";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieVideos,
  fetchRecommendedMovies,
  getImageUrl,
  getTrailerUrl,
} from "@/services/tmdb";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

const MovieDetails = () => {
  const { id, poster_path: paramPosterPath } = useLocalSearchParams<{
    id: string;
    poster_path: string;
  }>();
  const router = useRouter();
  const { addToMyList, removeFromMyList, isInMyList, user, userData } =
    useAuth();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [director, setDirector] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player State
  const [selectedServer, setSelectedServer] = useState("autoembed");

  useEffect(() => {
    const loadMovieData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const movieId = parseInt(id, 10);

        // Fetch all data in parallel
        const [details, credits, videos, recommended] = await Promise.all([
          fetchMovieDetails(movieId),
          fetchMovieCredits(movieId),
          fetchMovieVideos(movieId),
          fetchRecommendedMovies(movieId),
        ]);

        setMovie(details);
        setCast(credits.cast);
        setRecommendations(recommended);

        // Find director
        const directorCrew = credits.crew.find((c) => c.job === "Director");
        setDirector(directorCrew?.name || null);

        // Get trailer URL
        setTrailerUrl(getTrailerUrl(videos));
      } catch (err) {
        setError("Failed to load movie details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [id]);

  const openTrailer = async () => {
    if (trailerUrl) {
      await WebBrowser.openBrowserAsync(trailerUrl);
    }
  };

  const getEmbedUrl = () => {
    if (!movie) return "";
    switch (selectedServer) {
      case "autoembed":
        return `https://autoembed.co/movie/tmdb/${movie.id}`;
      case "vidsrc":
        return `https://vidsrc.to/embed/movie/${movie.id}`;
      case "twoembed":
        return `https://www.2embed.cc/embed/${movie.id}`;
      case "smashystream":
        return `https://player.smashy.stream/movie/${movie.id}`;
      default:
        return `https://autoembed.co/movie/tmdb/${movie.id}`;
    }
  };

  const navigateToMovie = (item: Movie) => {
    router.push({
      pathname: "/movies/[id]",
      params: { id: item.id, poster_path: item.poster_path },
    });
  };

  const displayPosterPath = movie?.poster_path || paramPosterPath;
  const posterUrl = getImageUrl(displayPosterPath, "w500");
  const backdropUrl = movie ? getImageUrl(movie.backdrop_path, "w780") : null;

  const isAdded = movie ? isInMyList(movie.id) : false;

  const handleMyList = async () => {
    if (!movie || !user) return;

    if (userData?.isGuest) {
      Toast.show({
        type: "error",
        text1: "Restricted",
        text2: "Verify your phone number to save movies.",
      });
      return;
    }

    if (isAdded) {
      await removeFromMyList(movie.id);
    } else {
      await addToMyList(movie as unknown as Movie);
    }
  };

  return (
    <View style={styles.container}>
      <RNImage source={images.bg} style={styles.backgroundImage} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {backdropUrl && (
            <Animated.View entering={FadeIn.duration(800)}>
              <Image
                source={{ uri: backdropUrl }}
                style={styles.backdrop}
                contentFit="cover"
                transition={500}
              />
              <View style={styles.backdropOverlay} />
            </Animated.View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Image
              source={icons.arrow}
              style={styles.backIcon}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Movie Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.posterRow}>
            {/* Shared Element Poster */}
            {posterUrl && (
              <AnimatedImage
                sharedTransitionTag={`poster-${id}`}
                source={{ uri: posterUrl }}
                style={styles.poster}
                contentFit="cover"
              />
            )}

            {/* Details - Fade in after transition */}
            <Animated.View
              style={styles.detailsColumn}
              entering={FadeInDown.delay(300).duration(500)}
            >
              <Text style={styles.title} numberOfLines={2}>
                {movie?.title || "Loading..."}
              </Text>

              {movie && (
                <>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      {new Date(movie.release_date).getFullYear()}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{movie.runtime} min</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={styles.ratingContainer}>
                      <Image
                        source={icons.star}
                        style={styles.starIcon}
                        tintColor="#FBBF24"
                      />
                      <Text style={styles.ratingText}>
                        {movie.vote_average.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.genres} numberOfLines={1}>
                    {movie.genres?.map((g) => g.name).join(", ")}
                  </Text>
                </>
              )}
            </Animated.View>
          </View>

          {movie ? (
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {trailerUrl && (
                  <TouchableOpacity
                    style={styles.trailerButton}
                    onPress={openTrailer}
                  >
                    <Image
                      source={icons.play}
                      style={styles.buttonIcon}
                      tintColor="#fff"
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { color: "#fff", fontSize: 14 },
                      ]}
                    >
                      Trailer
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isAdded && styles.saveButtonActive,
                  ]}
                  onPress={handleMyList}
                >
                  {isAdded ? (
                    <Text
                      style={{
                        color: "#ab8bff",
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                  ) : (
                    <Image
                      source={icons.save}
                      style={styles.saveIcon}
                      tintColor="#fff"
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Player Section (Always Visible) */}
              <View style={styles.playerSection}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerTitle}>Now Playing</Text>
                </View>
                <View style={styles.videoContainer}>
                  <EmbedPlayer url={getEmbedUrl()} />
                </View>
                <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                  <ServerSelector
                    movieId={movie.id}
                    selectedServer={selectedServer}
                    onSelect={(s) => setSelectedServer(s)}
                  />
                </View>
              </View>

              {/* Cast & Crew */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cast & Crew</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cast.slice(0, 10).map((item) => (
                    <CastCard key={item.id} cast={item} />
                  ))}
                </ScrollView>
              </View>

              {/* Overview */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.overview}>
                  {movie.overview || "No description available."}
                </Text>
              </View>

              {/* Similar Movies */}
              {recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>You May Also Like</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
                  >
                    {recommendations.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => navigateToMovie(item)}
                      >
                        <Image
                          source={{ uri: getImageUrl(item.poster_path) } as any}
                          style={{ width: 120, height: 180, borderRadius: 8 }}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Comments Section */}
              <View style={styles.section}>
                <CommentSection movieId={parseInt(id || "0")} />
              </View>
            </Animated.View>
          ) : (
            <ActivityIndicator
              size="small"
              color="#ab8bff"
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1b",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: "100%",
    opacity: 0.3,
  },
  heroSection: {
    height: 450,
    position: "relative",
  },
  backdrop: {
    width: width,
    height: 450,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  backIcon: { width: 20, height: 20, transform: [{ rotate: "180deg" }] },
  infoSection: {
    marginTop: -100, // Pull up to overlap hero
    paddingHorizontal: 20,
  },
  posterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailsColumn: {
    flex: 1,
    paddingBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  metaText: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: "600",
  },
  metaDot: {
    color: "#888",
    marginHorizontal: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,193,7,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starIcon: { width: 12, height: 12, marginRight: 4 },
  ratingText: { color: "#FBBF24", fontWeight: "bold", fontSize: 12 },
  genres: {
    color: "#aaa",
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  playButton: {
    flex: 1,
    backgroundColor: "#ab8bff",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ab8bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trailerButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonIcon: { width: 20, height: 20, marginRight: 8 },
  buttonText: { fontWeight: "bold", fontSize: 16, color: "#000" },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1E2D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButtonActive: {
    borderColor: "#ab8bff",
  },
  saveIcon: { width: 24, height: 24 },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  overview: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  playerSection: {
    height: 320,
    backgroundColor: "#000",
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#111",
  },
  playerTitle: { color: "#fff", fontWeight: "bold", flex: 1 },
  videoContainer: { flex: 1 },
  webview: { flex: 1 },
});

export default MovieDetails;
