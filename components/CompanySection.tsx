import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const STUDIO_SIZE = 80; // Larger size to fit 4 per row

// Studio images from website
const STUDIO_IMAGES = {
  dc: require("@/assets/studios/studio.jpg"),
  pixar: require("@/assets/studios/studio1.png"),
  marvel: require("@/assets/studios/studio2.jpg"),
  disney: require("@/assets/studios/studio3.jpg"),
  warner: require("@/assets/studios/studio4.jpg"),
  dreamworks: require("@/assets/studios/studio5.jpg"),
  mgm: require("@/assets/studios/studio6.jpg"),
  toei: require("@/assets/studios/studio7.png"),
  century20: require("@/assets/studios/studio8.png"),
  hulu: require("@/assets/studios/studio9.png"),
  apple: require("@/assets/studios/studio10.png"),
  amazon: require("@/assets/studios/studio11.jpg"),
};

interface StudioItem {
  key: string;
  id: number | string;
  name: string;
  image: any;
  type: "company" | "list";
}

const STUDIOS: StudioItem[] = [
  {
    key: "dc",
    id: 94805,
    name: "DC Movies",
    image: STUDIO_IMAGES.dc,
    type: "list",
  },
  {
    key: "pixar",
    id: 3,
    name: "Pixar",
    image: STUDIO_IMAGES.pixar,
    type: "company",
  },
  {
    key: "marvel",
    id: 420,
    name: "Marvel",
    image: STUDIO_IMAGES.marvel,
    type: "company",
  },
  {
    key: "disney",
    id: 6125,
    name: "Disney",
    image: STUDIO_IMAGES.disney,
    type: "company",
  },
  {
    key: "warner",
    id: 174,
    name: "Warner Bros",
    image: STUDIO_IMAGES.warner,
    type: "company",
  },
  {
    key: "dreamworks",
    id: 521,
    name: "DreamWorks",
    image: STUDIO_IMAGES.dreamworks,
    type: "company",
  },
  {
    key: "mgm",
    id: 21,
    name: "Metro Goldwyn",
    image: STUDIO_IMAGES.mgm,
    type: "company",
  },
  {
    key: "toei",
    id: 5542,
    name: "Toei Animation",
    image: STUDIO_IMAGES.toei,
    type: "company",
  },
  {
    key: "century20",
    id: 127928,
    name: "20th Century",
    image: STUDIO_IMAGES.century20,
    type: "company",
  },
  {
    key: "hulu",
    id: 8300044,
    name: "Hulu",
    image: STUDIO_IMAGES.hulu,
    type: "list",
  },
  {
    key: "apple",
    id: 8300049,
    name: "Apple TV+",
    image: STUDIO_IMAGES.apple,
    type: "list",
  },
  {
    key: "amazon",
    id: 20580,
    name: "Prime Video",
    image: STUDIO_IMAGES.amazon,
    type: "company",
  },
];

const CompanySection = () => {
  const router = useRouter();

  const handleStudioPress = (studio: StudioItem) => {
    if (studio.type === "list") {
      router.push({
        pathname: "/search",
        params: { listId: studio.id, studioName: studio.name },
      });
    } else {
      router.push({
        pathname: "/search",
        params: { companyId: studio.id, studioName: studio.name },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studios</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STUDIOS.map((studio) => (
          <TouchableOpacity
            key={studio.key}
            onPress={() => handleStudioPress(studio)}
            activeOpacity={0.85}
            style={styles.studioWrapper}
          >
            <View style={styles.studioCircle}>
              <Image
                source={studio.image}
                style={styles.studioImage}
                contentFit="cover"
              />
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
    gap: 14,
  },
  studioWrapper: {
    alignItems: "center",
    width: STUDIO_SIZE + 4,
  },
  studioCircle: {
    width: STUDIO_SIZE,
    height: STUDIO_SIZE,
    borderRadius: STUDIO_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#1A1A2E",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectedCircle: {
    borderColor: "#ab8bff",
    borderWidth: 3,
  },
  studioImage: {
    width: "100%",
    height: "100%",
  },
  studioName: {
    color: "#888",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  resultsContainer: {
    marginTop: 8,
  },
});

export default CompanySection;
