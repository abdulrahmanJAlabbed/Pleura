import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2.5; // Larger cards for mobile

// Category images from website
const CATEGORY_IMAGES = {
  action: require("@/assets/categories/category-1.jpg"),
  adventure: require("@/assets/categories/category-2.jpg"),
  comedy: require("@/assets/categories/category-3.jpg"),
  drama: require("@/assets/categories/category-4.jpg"),
  romance: require("@/assets/categories/category-5.jpeg"),
  horror: require("@/assets/categories/category-6.jpg"),
  scifi: require("@/assets/categories/category-7.jpg"),
  fantasy: require("@/assets/categories/category-8.jpg"),
  thriller: require("@/assets/categories/category-9.jpg"),
  crime: require("@/assets/categories/category-10.jpeg"),
  animation: require("@/assets/categories/category-11.jpeg"),
  family: require("@/assets/categories/category-12.jpeg"),
  mystery: require("@/assets/categories/category-14.jpeg"),
};

interface GenreItem {
  id: number;
  name: string;
  image: any;
}

// Movie genres with images
const MOVIE_GENRES: GenreItem[] = [
  { id: 28, name: "Action", image: CATEGORY_IMAGES.action },
  { id: 12, name: "Adventure", image: CATEGORY_IMAGES.adventure },
  { id: 35, name: "Comedy", image: CATEGORY_IMAGES.comedy },
  { id: 18, name: "Drama", image: CATEGORY_IMAGES.drama },
  { id: 10749, name: "Romance", image: CATEGORY_IMAGES.romance },
  { id: 27, name: "Horror", image: CATEGORY_IMAGES.horror },
  { id: 878, name: "Sci-Fi", image: CATEGORY_IMAGES.scifi },
  { id: 14, name: "Fantasy", image: CATEGORY_IMAGES.fantasy },
  { id: 53, name: "Thriller", image: CATEGORY_IMAGES.thriller },
  { id: 80, name: "Crime", image: CATEGORY_IMAGES.crime },
  { id: 16, name: "Animation", image: CATEGORY_IMAGES.animation },
  { id: 10751, name: "Family", image: CATEGORY_IMAGES.family },
];

// TV genres with images
const TV_GENRES: GenreItem[] = [
  { id: 18, name: "Drama", image: CATEGORY_IMAGES.drama },
  { id: 35, name: "Comedy", image: CATEGORY_IMAGES.comedy },
  { id: 80, name: "Crime", image: CATEGORY_IMAGES.crime },
  { id: 9648, name: "Mystery", image: CATEGORY_IMAGES.mystery },
  { id: 10765, name: "Sci-Fi", image: CATEGORY_IMAGES.scifi },
  { id: 10751, name: "Family", image: CATEGORY_IMAGES.family },
  { id: 16, name: "Animation", image: CATEGORY_IMAGES.animation },
];

// Anime genres with images
const ANIME_GENRES: GenreItem[] = [
  { id: 28, name: "Action", image: CATEGORY_IMAGES.action },
  { id: 16, name: "Animation", image: CATEGORY_IMAGES.animation },
  { id: 14, name: "Fantasy", image: CATEGORY_IMAGES.fantasy },
  { id: 12, name: "Adventure", image: CATEGORY_IMAGES.adventure },
  { id: 35, name: "Comedy", image: CATEGORY_IMAGES.comedy },
  { id: 18, name: "Drama", image: CATEGORY_IMAGES.drama },
];

interface GenreSectionProps {
  type: "movies" | "tv" | "anime";
}

import { useRouter } from "expo-router";

const GenreSection = ({ type }: GenreSectionProps) => {
  const router = useRouter();

  const genres =
    type === "movies" ? MOVIE_GENRES : type === "tv" ? TV_GENRES : ANIME_GENRES;

  const handleGenrePress = (genre: GenreItem) => {
    router.push({
      pathname: "/search",
      params: {
        genreId: genre.id,
        type: type === "movies" ? "movie" : "tv",
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by Genre</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            onPress={() => handleGenrePress(genre)}
            activeOpacity={0.85}
            style={styles.genreCard}
          >
            <Image
              source={genre.image}
              style={styles.genreImage}
              contentFit="cover"
            />
            <View style={styles.overlay} />
            <Text style={styles.genreName}>{genre.name}</Text>
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
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
    paddingHorizontal: 20,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  genreCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.6,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#ab8bff",
  },
  genreImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  genreName: {
    position: "absolute",
    bottom: 12,
    left: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      web: {
        textShadow: "0px 1px 4px rgba(0,0,0,0.8)",
      },
    }),
  },
  resultsContainer: {
    marginTop: 8,
  },
});

export default GenreSection;
