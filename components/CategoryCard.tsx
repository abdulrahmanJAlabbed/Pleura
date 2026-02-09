import { Category } from "@/constants/categories";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2;

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

// Premium color palette for each genre
const GENRE_COLORS: Record<
  number,
  { primary: string; secondary: string; accent: string }
> = {
  28: { primary: "#dc2626", secondary: "#7f1d1d", accent: "#fca5a5" }, // Action
  12: { primary: "#059669", secondary: "#064e3b", accent: "#6ee7b7" }, // Adventure
  35: { primary: "#d97706", secondary: "#78350f", accent: "#fcd34d" }, // Comedy
  18: { primary: "#7c3aed", secondary: "#4c1d95", accent: "#c4b5fd" }, // Drama
  10749: { primary: "#db2777", secondary: "#831843", accent: "#f9a8d4" }, // Romance
  27: { primary: "#374151", secondary: "#111827", accent: "#9ca3af" }, // Horror
  878: { primary: "#0891b2", secondary: "#164e63", accent: "#67e8f9" }, // Sci-Fi
  14: { primary: "#8b5cf6", secondary: "#5b21b6", accent: "#ddd6fe" }, // Fantasy
  53: { primary: "#475569", secondary: "#1e293b", accent: "#94a3b8" }, // Thriller
  80: { primary: "#78716c", secondary: "#44403c", accent: "#d6d3d1" }, // Crime
  16: { primary: "#ea580c", secondary: "#7c2d12", accent: "#fdba74" }, // Animation
  10751: { primary: "#16a34a", secondary: "#14532d", accent: "#86efac" }, // Family
};

const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const colors = GENRE_COLORS[category.id] || {
    primary: "#6366f1",
    secondary: "#312e81",
    accent: "#a5b4fc",
  };

  return (
    <Pressable
      onPress={() => onPress(category)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Main gradient background */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        {/* Glassmorphism overlay */}
        <View style={styles.glassOverlay}>
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.glassGradient}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{category.name}</Text>
          </View>

          {/* Arrow indicator */}
          <View
            style={[
              styles.arrowContainer,
              { backgroundColor: colors.accent + "30" },
            ]}
          >
            <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
          </View>
        </View>

        {/* Subtle border glow */}
        <View
          style={[styles.borderGlow, { borderColor: colors.accent + "20" }]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 72,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  glassGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 20,
    fontWeight: "300",
    marginTop: -2,
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
  },
});

export default CategoryCard;
