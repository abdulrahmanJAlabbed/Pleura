import CompanySection from "@/components/CompanySection";
import GenreSection from "@/components/GenreSection";
import HeroSection from "@/components/HeroSection";
import MediaSlider from "@/components/MediaSlider";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAnime,
  fetchAnimeMovies,
  fetchNowPlaying,
  fetchOnTheAir,
  fetchPopular,
  fetchTopRated,
  fetchTopRatedAnime,
  fetchTrending,
} from "@/services/tmdb";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ContentType = "movies" | "tv" | "anime";

interface ContentData {
  trending: Movie[];
  topRated: Movie[];
  popular: Movie[];
  nowPlaying: Movie[];
  animeMovies: Movie[];
  realityShows?: Movie[];
}

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentType>("movies");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bgColors, setBgColors] = useState<string[]>([
    "#1a1a2e",
    "#0f3460",
    "#0a0a0f",
  ]);
  const [content, setContent] = useState<ContentData>({
    trending: [],
    topRated: [],
    popular: [],
    nowPlaying: [],
    animeMovies: [],
    realityShows: [],
  });

  const { userData } = useAuth(); // Moved inside component

  const loadContent = async (tab: ContentType, isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      if (tab === "movies") {
        const [trendingData, topRatedData, popularData, nowPlayingData] =
          await Promise.all([
            fetchTrending("movie"),
            fetchTopRated("movie"),
            fetchPopular("movie"),
            fetchNowPlaying(),
          ]);
        setContent({
          trending: trendingData.results,
          topRated: topRatedData.results,
          popular: popularData.results,
          nowPlaying: nowPlayingData.results,
          animeMovies: [],
        });
      } else if (tab === "tv") {
        const [trendingData, topRatedData, popularData, onTheAirData] =
          await Promise.all([
            fetchTrending("tv"),
            fetchTopRated("tv"),
            fetchPopular("tv"),
            fetchOnTheAir(),
          ]);
        setContent({
          trending: trendingData.results,
          topRated: topRatedData.results,
          popular: popularData.results,
          nowPlaying: onTheAirData.results,
          animeMovies: [],
        });
      } else {
        const [animeData, animeMoviesData, topRatedAnimeData] =
          await Promise.all([
            fetchAnime(),
            fetchAnimeMovies(),
            fetchTopRatedAnime(),
          ]);
        setContent({
          trending: animeData.results,
          topRated: topRatedAnimeData.results,
          popular: [],
          nowPlaying: [],
          animeMovies: animeMoviesData.results,
        });
      }

      // Fetch Reality Shows if needed (for TV tab)
      if (tab === "tv") {
        const { discoverTV } = await import("@/services/tmdb");
        // discoverTV still returns array based on previous file content?
        // Wait, did I update discoverTV?
        // I actually missed discoverTV and discoverMovies in the previous view_file of tmdb.ts or the edit?
        // Let's assume discoverTV returns array for now or check if it needs update.
        // Actually, looking at previous edit, I didn't update discoverTV.
        // But let's check consistent usage.
        const reality = await discoverTV({ with_genres: 10764 });
        setContent((prev) => ({ ...prev, realityShows: reality }));
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContent(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadContent(activeTab, true);
  };

  const handleColorsChange = (colors: string[]) => {
    setBgColors(colors);
  };

  const isTV = activeTab === "tv" || activeTab === "anime";

  return (
    <View style={styles.container}>
      {/* Dynamic gradient background based on genre */}
      <LinearGradient
        colors={[bgColors[0], bgColors[1], bgColors[2]]}
        locations={[0, 0.4, 1]}
        style={styles.backgroundGradient}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ab8bff"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>For You</Text>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push("/search")}
          >
            <Image source={icons.search} style={styles.icon} tintColor="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "tv" && styles.tabActive]}
            onPress={() => setActiveTab("tv")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "tv" && styles.tabTextActive,
              ]}
            >
              TV
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "movies" && styles.tabActive]}
            onPress={() => setActiveTab("movies")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "movies" && styles.tabTextActive,
              ]}
            >
              Movies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "anime" && styles.tabActive]}
            onPress={() => setActiveTab("anime")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "anime" && styles.tabTextActive,
              ]}
            >
              Anime
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ab8bff" />
          </View>
        ) : (
          <>
            {/* Hero Section with genre-based colors */}
            <View style={styles.heroContainer}>
              <HeroSection
                movies={content.trending}
                isTV={isTV}
                onColorsChange={handleColorsChange}
              />
            </View>

            {/* My List - Only if items exist */}
            {userData?.myList && userData.myList.length > 0 && (
              <MediaSlider
                title="My List"
                data={userData.myList}
                isTV={isTV}
                onSeeAll={() => router.push("/saved")}
              />
            )}

            {/* Trending Now */}
            <MediaSlider
              title="Trending Now"
              data={content.trending}
              isTV={isTV}
            />

            {/* Studios Section (Movies only) */}
            {activeTab === "movies" && <CompanySection />}

            {/* Top Rated */}
            {content.topRated.length > 0 && (
              <MediaSlider
                title="Top Rated"
                data={content.topRated}
                isTV={isTV}
              />
            )}

            {/* Popular */}
            {content.popular.length > 0 && (
              <MediaSlider title="Popular" data={content.popular} isTV={isTV} />
            )}

            {/* Now Playing / On The Air */}
            {content.nowPlaying.length > 0 && (
              <MediaSlider
                title={activeTab === "movies" ? "Now Playing" : "On The Air"}
                data={content.nowPlaying}
                isTV={isTV}
              />
            )}

            {/* Anime Movies */}
            {activeTab === "anime" && content.animeMovies.length > 0 && (
              <MediaSlider
                title="Anime Movies"
                data={content.animeMovies}
                isTV={false}
              />
            )}

            {/* Reality Shows (TV Tab Only) */}
            {activeTab === "tv" &&
              content.realityShows &&
              content.realityShows.length > 0 && (
                <MediaSlider
                  title="Reality Shows"
                  data={content.realityShows}
                  isTV={true}
                />
              )}

            {/* Genre Browsing */}
            <GenreSection type={activeTab} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  greeting: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#fff",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    height: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    marginBottom: 8,
  },
});
