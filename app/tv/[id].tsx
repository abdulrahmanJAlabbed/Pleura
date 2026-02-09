import CastCard from "@/components/CastCard";
import CommentSection from "@/components/CommentSection";
import EmbedPlayer from "@/components/EmbedPlayer";
import ServerSelector from "@/components/ServerSelector";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSeasonDetails,
  fetchTVCredits,
  fetchTVDetails,
  fetchTVRecommendations,
  getImageUrl,
  getTrailerUrl,
  getTVVideos,
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

const TVDetailsPage = () => {
  const { id, poster_path: paramPosterPath } = useLocalSearchParams<{
    id: string;
    poster_path: string;
  }>();
  const router = useRouter();
  const { addToMyList, removeFromMyList, isInMyList, user, userData } =
    useAuth();

  const [tvShow, setTvShow] = useState<TVDetails | null>(null);
  const [currentSeason, setCurrentSeason] = useState<SeasonDetails | null>(
    null,
  );
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]); // Using Movie type for simplicity as Recs are similar
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player State
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState("autoembed");

  useEffect(() => {
    const loadTVData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const tvId = parseInt(id, 10);

        // Fetch TV Details, Credits, Recommendations, Videos
        const [details, credits, recommended, videos] = await Promise.all([
          fetchTVDetails(tvId),
          fetchTVCredits(tvId),
          fetchTVRecommendations(tvId),
          getTVVideos(tvId),
        ]);

        setTvShow(details);
        setCast(credits.cast);
        setRecommendations(recommended);
        setTrailerUrl(getTrailerUrl(videos));

        // Fetch Season 1 by default
        loadSeason(tvId, 1);
      } catch (err) {
        setError("Failed to load TV details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTVData();
  }, [id]);

  const loadSeason = async (tvId: number, seasonNum: number) => {
    try {
      setSeasonLoading(true);
      const seasonData = await fetchSeasonDetails(tvId, seasonNum);
      setCurrentSeason(seasonData);
      setSelectedSeasonNumber(seasonNum);

      // Auto-select first episode if available and none selected (e.g. initial load)
      if (
        seasonData.episodes &&
        seasonData.episodes.length > 0 &&
        !selectedEpisode
      ) {
        playEpisode(seasonData.episodes[0]);
      }
    } catch (err) {
      console.error("Failed to load season", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleSeasonChange = (seasonNum: number) => {
    if (tvShow) {
      loadSeason(tvShow.id, seasonNum);
    }
  };

  const openTrailer = async () => {
    if (trailerUrl) {
      await WebBrowser.openBrowserAsync(trailerUrl);
    }
  };

  const playEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    // Scroll to player behavior if needed
  };

  const getEmbedUrl = () => {
    if (!tvShow || !selectedEpisode) return "";

    const s = selectedEpisode.season_number;
    const e = selectedEpisode.episode_number;

    switch (selectedServer) {
      case "autoembed":
        return `https://player.autoembed.cc/embed/tv/${tvShow.id}/${s}/${e}`;
      case "vidsrc":
        return `https://vidsrc.to/embed/tv/${tvShow.id}/${s}/${e}`;
      case "twoembed":
        return `https://www.2embed.cc/embedtv/${tvShow.id}&s=${s}&e=${e}`;
      case "smashystream":
        return `https://player.smashy.stream/tv/${tvShow.id}?s=${s}&e=${e}`;
      default:
        return `https://player.autoembed.cc/embed/tv/${tvShow.id}/${s}/${e}`;
    }
  };

  const navigateToMovie = (item: Movie) => {
    // Reusing navigate logic, checking media type if needed
    if (item.media_type === "tv") {
      router.push({
        pathname: "/tv/[id]",
        params: { id: item.id, poster_path: item.poster_path },
      });
    } else {
      router.push({
        pathname: "/movies/[id]",
        params: { id: item.id, poster_path: item.poster_path },
      });
    }
  };

  const isAdded = tvShow ? isInMyList(tvShow.id) : false;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f0f1b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ab8bff" />
      </View>
    );
  }

  if (!tvShow) return null;

  const displayPosterPath = tvShow.poster_path || paramPosterPath;
  const posterUrl = getImageUrl(displayPosterPath);
  const backdropUrl = getImageUrl(tvShow.backdrop_path);

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
              <AnimatedImage
                sharedTransitionTag={`poster-${tvShow.id}-backdrop`}
                source={{ uri: backdropUrl }}
                style={styles.backdrop}
                contentFit="cover"
              />
              <View style={styles.backdropOverlay} />
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={icons.arrow}
              style={styles.backIcon}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.posterRow}>
            {posterUrl && (
              <AnimatedImage
                sharedTransitionTag={`poster-${tvShow.id}`}
                source={{ uri: posterUrl }}
                style={styles.poster}
                contentFit="cover"
              />
            )}

            <Animated.View
              style={styles.detailsColumn}
              entering={FadeInDown.delay(300).duration(500)}
            >
              <Text style={styles.title} numberOfLines={2}>
                {tvShow.name}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {new Date(tvShow.first_air_date).getFullYear()}
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.metaText}>
                  {tvShow.number_of_seasons} Seasons
                </Text>
                <Text style={styles.dot}>•</Text>
                <View style={styles.ratingContainer}>
                  <Image
                    source={icons.star}
                    style={styles.starIcon}
                    tintColor="#FBBF24"
                  />
                  <Text style={styles.ratingText}>
                    {tvShow.vote_average.toFixed(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.genres} numberOfLines={1}>
                {tvShow.genres.map((g) => g.name).join(", ")}
              </Text>
            </Animated.View>
          </View>

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
                    style={[styles.buttonText, { color: "#fff", fontSize: 14 }]}
                  >
                    Trailer
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.saveButton, isAdded && styles.saveButtonActive]}
                onPress={() => {
                  if (userData?.isGuest) {
                    Toast.show({
                      type: "error",
                      text1: "Restricted",
                      text2: "Verify your phone number to save shows.",
                    });
                    return;
                  }

                  if (isAdded) {
                    removeFromMyList(tvShow.id);
                  } else {
                    addToMyList({
                      ...tvShow,
                      title: tvShow.name,
                      media_type: "tv",
                    } as any);
                  }
                }}
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

            {/* Player Section */}
            {selectedEpisode && (
              <View style={styles.playerSection}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerTitle} numberOfLines={1}>
                    S{selectedEpisode.season_number}:E
                    {selectedEpisode.episode_number} - {selectedEpisode.name}
                  </Text>

                  <View style={styles.playerControls}>
                    <TouchableOpacity
                      onPress={() => {
                        const currentIndex =
                          currentSeason?.episodes.findIndex(
                            (e) => e.id === selectedEpisode.id,
                          ) || 0;
                        if (
                          currentIndex > 0 &&
                          currentSeason?.episodes[currentIndex - 1]
                        ) {
                          playEpisode(currentSeason.episodes[currentIndex - 1]);
                        }
                      }}
                      disabled={
                        !currentSeason?.episodes.find(
                          (e) =>
                            e.episode_number ===
                            selectedEpisode.episode_number - 1,
                        )
                      }
                      style={[
                        styles.controlButton,
                        !currentSeason?.episodes.find(
                          (e) =>
                            e.episode_number ===
                            selectedEpisode.episode_number - 1,
                        ) && styles.disabledButton,
                      ]}
                    >
                      <Text style={styles.controlText}>Prev</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const currentIndex =
                          currentSeason?.episodes.findIndex(
                            (e) => e.id === selectedEpisode.id,
                          ) || 0;
                        if (
                          currentSeason?.episodes &&
                          currentIndex < currentSeason.episodes.length - 1
                        ) {
                          playEpisode(currentSeason.episodes[currentIndex + 1]);
                        }
                      }}
                      disabled={
                        !currentSeason?.episodes.find(
                          (e) =>
                            e.episode_number ===
                            selectedEpisode.episode_number + 1,
                        )
                      }
                      style={[
                        styles.controlButton,
                        !currentSeason?.episodes.find(
                          (e) =>
                            e.episode_number ===
                            selectedEpisode.episode_number + 1,
                        ) && styles.disabledButton,
                      ]}
                    >
                      <Text style={styles.controlText}>Next</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedEpisode(null)}
                      style={{ marginLeft: 10 }}
                    >
                      <Text style={{ color: "#ab8bff" }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.videoContainer}>
                  <EmbedPlayer url={getEmbedUrl()} />
                </View>
                <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                  <ServerSelector
                    selectedServer={selectedServer}
                    onSelect={(s) => setSelectedServer(s)}
                  />
                </View>
              </View>
            )}

            {/* Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>
                {tvShow.overview || "No description available."}
              </Text>
            </View>

            {/* Season Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seasons</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonList}
              >
                {tvShow.seasons.map((season) => (
                  <TouchableOpacity
                    key={season.id}
                    style={[
                      styles.seasonChip,
                      selectedSeasonNumber === season.season_number &&
                        styles.activeSeasonChip,
                    ]}
                    onPress={() => handleSeasonChange(season.season_number)}
                  >
                    <Text
                      style={[
                        styles.seasonText,
                        selectedSeasonNumber === season.season_number &&
                          styles.activeSeasonText,
                      ]}
                    >
                      {season.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Episode List (Horizontal) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Episodes{" "}
                {seasonLoading && (
                  <ActivityIndicator size="small" color="#ab8bff" />
                )}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.episodeListContent}
              >
                {!seasonLoading &&
                  currentSeason?.episodes.map((episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={[
                        styles.episodeCard,
                        selectedEpisode?.id === episode.id &&
                          styles.selectedEpisodeCard,
                      ]}
                      onPress={() => playEpisode(episode)}
                    >
                      <View style={styles.episodeImageContainer}>
                        <Image
                          source={{
                            uri:
                              getImageUrl(episode.still_path) ||
                              getImageUrl(tvShow.backdrop_path) ||
                              "",
                          }}
                          style={styles.episodeImage}
                          contentFit="cover"
                          transition={200}
                        />
                        {selectedEpisode?.id === episode.id && (
                          <View style={styles.playingOverlay}>
                            <Image
                              source={icons.play}
                              style={styles.smallPlayIcon}
                              tintColor="#fff"
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.episodeMeta}>
                        <Text style={styles.episodeNum}>
                          E{episode.episode_number}
                        </Text>
                        <Text style={styles.episodeTitle} numberOfLines={1}>
                          {episode.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            {/* Cast & Crew */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast & Crew</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
              >
                {cast.slice(0, 10).map((item) => (
                  <CastCard key={item.id} cast={item} />
                ))}
              </ScrollView>
            </View>

            {/* Similar TV Shows */}
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
                        source={{ uri: getImageUrl(item.poster_path) || "" }}
                        style={{ width: 120, height: 180, borderRadius: 8 }}
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
    marginTop: -100,
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
  dot: { color: "#888", marginHorizontal: 6 },
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
  myListButton: { width: 24, height: 24 },
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

  // Re-used section styles
  section: { marginTop: 24 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 20, // Check if this should be 0 if inside infoSection with padding?
    // infoSection has paddingHorizontal: 20, so removing it from sub-items or keeping it?
    // Movie details uses paddingHorizontal: 20 in sectionTitle but section is inside infoSection too?
    // Wait, in MovieDetails, infoSection wraps posterRow.
    // Then subsequent sections (Overview, etc) are SIBLINGS to posterRow inside infoSection?
    // Checking MovieDetails source...
  },

  seasonList: { gap: 10 },
  seasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1E2D",
    borderWidth: 1,
    borderColor: "#333",
  },
  activeSeasonChip: {
    backgroundColor: "#ab8bff",
    borderColor: "#ab8bff",
  },
  seasonText: { color: "#ccc" },
  activeSeasonText: { color: "#000", fontWeight: "bold" },

  episodeListContent: {
    gap: 12,
  },
  episodeCard: {
    width: 160,
    marginRight: 4,
  },
  selectedEpisodeCard: {
    opacity: 0.8,
  },
  episodeImageContainer: {
    width: 160,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#1f1f2e",
    position: "relative",
  },
  episodeImage: {
    width: "100%",
    height: "100%",
  },
  episodeMeta: {
    paddingHorizontal: 4,
  },
  episodeNum: {
    color: "#ab8bff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  smallPlayIcon: {
    width: 24,
    height: 24,
    opacity: 0.8,
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
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1f1f2e",
  },
  playerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.3,
  },
  controlText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: { flex: 1 },
  overview: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 22,
  },
});

export default TVDetailsPage;
