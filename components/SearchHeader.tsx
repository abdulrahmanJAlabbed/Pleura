import SearchBar from "@/components/SearchBar";
import { Category } from "@/constants/categories";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  handleClear: () => void;
  viewMode: "categories" | "search" | "genre";
  genreId?: string;
  companyId?: string;
  category?: string;
  loading: boolean;
  moviesLength: number;
  totalResults: number;
  resultTitle: string;
  selectedCategory: Category | null;
}

const SearchHeader = ({
  searchQuery,
  setSearchQuery,
  handleClear,
  viewMode,
  genreId,
  companyId,
  category,
  loading,
  moviesLength,
  totalResults,
  resultTitle,
  selectedCategory,
}: SearchHeaderProps) => {
  const showBackButton =
    viewMode === "genre" ||
    (viewMode === "search" && (genreId || companyId || category));

  return (
    <View style={styles.headerContainer}>
      {/* App-style gradient background */}
      <LinearGradient
        colors={["#0a0a0f", "transparent"]}
        style={styles.headerGradient}
      />

      {/* Page title with Netflix vibe */}
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.pageTitle}>Explore</Text>
      </Animated.View>

      {/* Search bar container */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search movies, shows, anime..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClear}
          autoFocus={false}
        />
      </View>

      {/* Back button when viewing category results */}
      {showBackButton && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Image
                source={icons.arrow}
                style={styles.backIcon}
                tintColor="#ab8bff"
              />
              <Text style={styles.backText}>Back to Browse</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Results header with count */}
      {viewMode !== "categories" && moviesLength > 0 && !loading && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.resultsHeader}
        >
          <View style={styles.resultsTitleRow}>
            <View style={styles.redAccent} />
            <Text style={styles.resultsTitle}>
              {viewMode === "genre" && selectedCategory
                ? `${selectedCategory.name}`
                : resultTitle || "Results"}
            </Text>
          </View>
          <View style={styles.resultsCountBadge}>
            <Text style={styles.resultsCount}>
              {totalResults > 0
                ? totalResults.toLocaleString()
                : moviesLength.toString()}
            </Text>
            <Text style={styles.resultsCountLabel}>titles</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  backButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(171, 139, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(171, 139, 255, 0.3)",
    alignSelf: "flex-start",
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ rotate: "180deg" }],
    marginRight: 8,
  },
  backText: {
    color: "#ab8bff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  resultsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  redAccent: {
    width: 4,
    height: 24,
    backgroundColor: "#ab8bff",
    borderRadius: 2,
    marginRight: 12,
  },
  resultsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  resultsCountBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resultsCount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 4,
  },
  resultsCountLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SearchHeader;
