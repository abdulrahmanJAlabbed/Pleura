import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const SPACING = 12;
const ITEM_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function Saved() {
  const { userData } = useAuth();
  const router = useRouter();
  const myList = userData?.myList || [];

  const renderItem = ({ item }: { item: Movie }) => (
    <Link href={`/movies/${item.id}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
          style={styles.poster}
          contentFit="cover"
          transition={500}
        />
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
        <Text style={styles.countText}>{myList.length} items</Text>
      </View>

      {myList.length > 0 ? (
        <FlatList
          data={myList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="bookmark-outline" size={48} color="#666" />
          </View>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Movies and TV shows you add to your list will appear here.
          </Text>
          <Link href="/(tabs)/search" asChild>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Content</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030014",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  countText: {
    fontSize: 14,
    color: "#888",
  },
  listContent: {
    padding: SPACING,
  },
  columnWrapper: {
    gap: SPACING,
    marginBottom: SPACING,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1A1A2E",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: -40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: "#ab8bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
