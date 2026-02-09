import CategoryCard from "@/components/CategoryCard";
import SearchHeader from "@/components/SearchHeader";
import { CATEGORIES, Category } from "@/constants/categories";
import { icons } from "@/constants/icons";
import {
  discoverMovies,
  discoverTV,
  fetchAnime,
  fetchAnimeMovies,
  fetchByCompanyPaginated,
  fetchList,
  fetchNowPlaying,
  fetchPopular,
  fetchTopRated,
  fetchTrending,
  searchMovies,
  searchMulti,
  searchTV,
} from "@/services/tmdb";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get("window");
const POSTER_WIDTH = (width - 52) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

type ViewMode = "categories" | "search" | "genre";
type SearchType = "multi" | "movie" | "tv" | "anime";

// Filter chip data with icons
const FILTER_CHIPS: { type: SearchType; label: string; icon: string }[] = [
  { type: "multi", label: "All", icon: "🎬" },
  { type: "movie", label: "Movies", icon: "🎥" },
  { type: "tv", label: "TV Shows", icon: "📺" },
  { type: "anime", label: "Anime", icon: "🎌" },
];

const Search = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { type, query, genreId, companyId, category, listId, studioName, t } =
    useLocalSearchParams<{
      type: string;
      query: string;
      genreId: string;
      companyId: string;
      category: string;
      listId: string;
      studioName: string;
      t?: string;
    }>();

  // Core state
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchType, setSearchType] = useState<SearchType>("multi");

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultTitle, setResultTitle] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce timer ref
  const searchTimeoutRef = useRef<number | null>(null);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // If text is empty, reset to categories view
      if (!text.trim()) {
        if (!query && !genreId && !companyId && !category && !listId) {
          setMovies([]);
          setViewMode("categories");
          setResultTitle("");
        }
        return;
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    },
    [query, genreId, companyId, category, listId],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Reset state on tab press
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Only reset if there are no params (user tapped tab while on search)
      if (
        !query &&
        !genreId &&
        !companyId &&
        !category &&
        !listId &&
        viewMode !== "categories"
      ) {
        // Do nothing - user is navigating with intent
      }
    });
    return unsubscribe;
  }, [navigation, query, genreId, companyId, category, listId, viewMode]);

  const resetToDefault = () => {
    setSearchQuery("");
    setMovies([]);
    setViewMode("categories");
    setSelectedCategory(null);
    setResultTitle("");
    setError(null);
    setPage(1);
    setTotalResults(0);
    setSearchType("multi");
    router.setParams({
      query: "",
      genreId: "",
      companyId: "",
      category: "",
      listId: "",
      studioName: "",
      type: "",
    });
  };

  // Handle URL params on mount/change
  useEffect(() => {
    if (query || genreId || companyId || category || listId) {
      handleInitialParamLoad();
    }
  }, [query, genreId, companyId, category, listId, type, t]);

  const handleInitialParamLoad = async () => {
    setLoading(true);
    setError(null);
    setViewMode("search");
    setMovies([]);
    setPage(1);
    setTotalResults(0);

    try {
      let results: Movie[] = [];
      let title = "Results";
      let pages = 1;

      if (query) {
        setSearchQuery(query);
        title = `"${query}"`;
        const data = await searchMovies(query);
        results = data.results;
        setTotalResults(data.totalResults);
        pages = data.totalPages;
      } else if (genreId) {
        const genreName =
          CATEGORIES.find((c) => c.id === Number(genreId))?.name || "Genre";
        title = `${genreName}`;

        let data;
        if (type === "tv") {
          data = await discoverTV({ with_genres: genreId });
        } else {
          data = await discoverMovies({ with_genres: genreId });
        }
        results = data.results;
        setTotalResults(data.totalResults);
        pages = data.totalPages;
      } else if (listId) {
        title = studioName || "Collection";
        const listData = await fetchList(listId, 1);
        results = listData.results;
        pages = listData.totalPages;
        setTotalResults(listData.totalResults);
      } else if (companyId) {
        title = studioName || "Studio";
        const companyData = await fetchByCompanyPaginated(Number(companyId), 1);
        results = companyData.results;
        pages = companyData.totalPages;
        setTotalResults(companyData.totalResults);
      } else if (category) {
        title = getCategoryTitle(category, type);
        const data = await fetchCategoryContent(category, type);
        results = data.results;
        setTotalResults(data.totalResults);
        pages = data.totalPages;
      }

      setResultTitle(title);
      setMovies(results);
      setTotalPages(pages);
      setHasMore(results.length >= 20 && pages > 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (cat: string, mediaType?: string) => {
    const isTV = mediaType === "tv";
    const titles: Record<string, string> = {
      now_playing: isTV ? "On The Air" : "Now Playing",
      popular: "Popular",
      top_rated: "Top Rated",
      trending: "Trending Now",
      anime_movies: "Anime Movies",
      anime: "Anime Series",
      reality: "Reality Shows",
    };
    return titles[cat] || "Results";
  };

  const fetchCategoryContent = async (
    cat: string,
    mediaType?: string,
    pageNum: number = 1,
  ) => {
    const isTV = mediaType === "tv";
    switch (cat) {
      case "now_playing":
        if (isTV) {
          const { fetchOnTheAir } = await import("@/services/tmdb");
          return await fetchOnTheAir(pageNum);
        }
        return await fetchNowPlaying(pageNum);
      case "popular":
        return await fetchPopular(isTV ? "tv" : "movie", pageNum);
      case "top_rated":
        return await fetchTopRated(isTV ? "tv" : "movie", pageNum);
      case "trending":
        return await fetchTrending(isTV ? "tv" : "movie");
      case "anime_movies":
        return await fetchAnimeMovies(pageNum);
      case "anime":
        return await fetchAnime(pageNum);
      case "reality":
        return await discoverTV({ with_genres: 10764, page: pageNum });
      default:
        return { results: [], totalResults: 0, totalPages: 0 };
    }
  };

  // Search handler
  const performSearch = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        if (!query && !genreId && !companyId && !category && !listId) {
          setMovies([]);
          setViewMode("categories");
        }
        return;
      }

      setLoading(true);
      setError(null);
      setViewMode("search");
      setPage(1);

      try {
        let data;
        if (searchType === "movie") {
          data = await searchMovies(text);
        } else if (searchType === "tv") {
          data = await searchTV(text);
        } else if (searchType === "anime") {
          const tvData = await searchTV(text);
          data = {
            ...tvData,
            results: tvData.results.filter((show) =>
              show.genre_ids?.includes(16),
            ),
          };
        } else {
          data = await searchMulti(text);
        }

        setMovies(data.results);
        setTotalResults(data.totalResults);
        setTotalPages(data.totalPages);
        setResultTitle(`"${text}"`);
        setHasMore(data.results.length >= 20 && data.totalPages > 1);
      } catch (err) {
        setError("Search failed. Try again.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [query, genreId, companyId, category, listId, searchType],
  );

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchType]);

  // Category press handler
  const handleCategoryPress = (cat: Category) => {
    router.setParams({
      genreId: cat.id.toString(),
      type: "movie",
      query: "",
      companyId: "",
      category: "",
      listId: "",
      studioName: "",
    });
    setSelectedCategory(cat);
    setViewMode("genre");
  };

  // Clear/reset handler
  const handleClear = () => {
    resetToDefault();
  };

  // Load more (infinite scroll)
  const loadMore = async () => {
    if (loading || loadingMore || !hasMore || page >= totalPages) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      let newResults: Movie[] = [];

      if (searchQuery && !genreId && !companyId && !category && !listId) {
        const data = await searchMovies(searchQuery, nextPage);
        newResults = data.results;
      } else if (listId) {
        const listData = await fetchList(listId, nextPage);
        newResults = listData.results;
      } else if (companyId) {
        const companyData = await fetchByCompanyPaginated(
          Number(companyId),
          nextPage,
        );
        newResults = companyData.results;
      } else if (genreId) {
        const data =
          type === "tv"
            ? await discoverTV({ with_genres: genreId, page: nextPage })
            : await discoverMovies({ with_genres: genreId, page: nextPage });
        newResults = data.results;
      } else if (category) {
        const data = await fetchCategoryContent(category, type, nextPage);
        newResults = data.results;
      }

      if (newResults.length > 0) {
        setMovies((prev) => [...prev, ...newResults]);
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Navigate to detail page
  const navigateToDetail = (item: Movie) => {
    const isTV = item.media_type === "tv" || (item as any).first_air_date;
    router.push({
      pathname: isTV ? "/tv/[id]" : "/movies/[id]",
      params: { id: item.id, poster_path: item.poster_path },
    });
  };

  // Categories grid
  const renderCategories = () => (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.categoriesContainer}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.redAccent} />
        <Text style={styles.sectionTitle}>Browse by Genre</Text>
      </View>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat, index) => (
          <Animated.View
            key={cat.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
          >
            <CategoryCard category={cat} onPress={handleCategoryPress} />
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  // Filter chips
  const renderFilterChips = () => {
    if (viewMode === "categories") return null;
    if (genreId || companyId || category || listId) return null;

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.filterContainer}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.type}
              style={[
                styles.filterChip,
                searchType === chip.type && styles.activeFilterChip,
              ]}
              onPress={() => setSearchType(chip.type)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterIcon}>{chip.icon}</Text>
              <Text
                style={[
                  styles.filterText,
                  searchType === chip.type && styles.activeFilterText,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  // Empty state
  const renderEmptyState = () => {
    if (loading) return null;

    if (viewMode === "categories") {
      return renderCategories();
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleClear} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (viewMode === "search" && movies.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Image
              source={icons.search}
              style={styles.emptyIcon}
              tintColor="rgba(255,255,255,0.2)"
            />
          </View>
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptySubtitle}>
            Try different keywords or browse categories
          </Text>
          <TouchableOpacity onPress={handleClear} style={styles.browseButton}>
            <Text style={styles.browseText}>Browse Categories</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Movie card with animation
  const MovieCard = ({ item, index }: { item: Movie; index: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15 });
    };

    const posterUri = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
        : null;

    return (
      <Animated.View entering={FadeInUp.delay((index % 10) * 50).duration(300)}>
        <AnimatedTouchable
          style={[styles.movieCard, animatedStyle]}
          onPress={() => navigateToDetail(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={styles.movieImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {/* Rating badge */}
          {item.vote_average > 0 && (
            <View style={styles.ratingBadge}>
              <Image
                source={icons.star}
                style={styles.starIcon}
                tintColor="#FBBF24"
              />
              <Text style={styles.ratingText}>
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Title gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.95)"]}
            style={styles.titleGradient}
          />

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title || item.name}
            </Text>
            {(item.release_date || (item as any).first_air_date) && (
              <Text style={styles.yearText}>
                {new Date(
                  item.release_date || (item as any).first_air_date || "",
                ).getFullYear()}
              </Text>
            )}
          </View>

          {/* Media type badge for multi-search */}
          {item.media_type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.media_type === "tv" ? "TV" : "Movie"}
              </Text>
            </View>
          )}
        </AnimatedTouchable>
      </Animated.View>
    );
  };

  // Footer (loading indicator)
  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E50914" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  // Header component
  const ListHeader = useMemo(
    () => (
      <View>
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          handleClear={handleClear}
          viewMode={viewMode}
          genreId={genreId}
          companyId={companyId}
          category={category as string}
          loading={loading}
          moviesLength={movies.length}
          totalResults={totalResults}
          resultTitle={resultTitle}
          selectedCategory={selectedCategory}
        />
        {renderFilterChips()}
      </View>
    ),
    [
      searchQuery,
      viewMode,
      genreId,
      companyId,
      category,
      loading,
      movies.length,
      totalResults,
      resultTitle,
      selectedCategory,
      searchType,
    ],
  );

  return (
    <View style={styles.container}>
      {/* Background gradient matching app theme */}
      <LinearGradient
        colors={["#0a0a0f", "#0a0a0f", "#0a0a0f"]}
        style={StyleSheet.absoluteFill}
      />

      {loading && movies.length === 0 ? (
        <View style={styles.fullLoader}>
          {ListHeader}
          <View style={styles.skeletonContainer}>
            {[...Array(6)].map((_, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 100).duration(300)}
                style={styles.skeletonCard}
              >
                <LinearGradient
                  colors={["#2a2a2a", "#1a1a1a", "#2a2a2a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item, index }) => (
            <MovieCard item={item} index={index} />
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS !== "web"}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  listContent: {
    paddingTop: 50,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
  },
  fullLoader: {
    flex: 1,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  skeletonCard: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  redAccent: {
    width: 4,
    height: 24,
    backgroundColor: "#ab8bff",
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
  },
  filterContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  activeFilterChip: {
    backgroundColor: "#ab8bff",
    borderColor: "#ab8bff",
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    width: 40,
    height: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "#ab8bff",
    borderRadius: 8,
  },
  browseText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#ab8bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  movieCard: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#1a1a2e",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  movieImage: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  ratingText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
  },
  titleGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  titleContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 4,
  },
  yearText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
  typeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ab8bff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 10,
  },
  loadingMoreText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
  },
});

export default Search;
