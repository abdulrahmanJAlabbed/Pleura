import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

interface MediaSliderProps {
  title: string;
  data: Movie[];
  isTV?: boolean;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

const MediaSlider = ({
  title,
  data,
  isTV = false,
  showSeeAll = true,
  onSeeAll,
}: MediaSliderProps) => {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  const handlePress = (item: Movie) => {
    if (isTV || item.media_type === "tv") {
      router.push({
        pathname: "/tv/[id]",
        params: { id: item.id, poster_path: item.poster_path },
      });
      return;
    }
    router.push({
      pathname: "/movies/[id]",
      params: { id: item.id, poster_path: item.poster_path },
    });
  };

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }

    // Default behavior if no custom handler
    let categoryParam = "";
    if (title === "Now Playing" || title === "On The Air")
      categoryParam = "now_playing";
    else if (title === "Popular") categoryParam = "popular";
    else if (title === "Top Rated") categoryParam = "top_rated";
    else if (title === "Trending Now") categoryParam = "trending";
    else if (title === "Anime Movies") categoryParam = "anime_movies";
    else if (title === "Anime Series") categoryParam = "anime";
    else if (title === "Reality Shows") categoryParam = "reality";

    if (categoryParam) {
      router.push({
        pathname: "/(tabs)/search",
        params: {
          category: categoryParam,
          type: isTV ? "tv" : "movie",
          t: Date.now().toString(), // Force update
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeAll && (
          <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Image
              source={icons.arrow}
              style={styles.arrowIcon}
              tintColor="#888"
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handlePress(item)}
            activeOpacity={0.85}
            style={styles.card}
          >
            <AnimatedImage
              sharedTransitionTag={`poster-${item.id}`}
              source={{
                uri: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
              }}
              style={styles.poster}
              contentFit="cover"
            />
            <View style={styles.ratingBadge}>
              <Image
                source={icons.star}
                style={styles.starIcon}
                tintColor="#FBBF24"
              />
              <Text style={styles.ratingText}>
                {item.vote_average?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  arrowIcon: {
    width: 12,
    height: 12,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 130,
    borderRadius: 10,
    overflow: "hidden",
  },
  poster: {
    width: 130,
    height: 195,
    borderRadius: 10,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 10,
    height: 10,
    marginRight: 3,
  },
  ratingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

export default MediaSlider;
