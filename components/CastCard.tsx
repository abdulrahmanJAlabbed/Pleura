import { icons } from "@/constants/icons";
import { getImageUrl } from "@/services/tmdb";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CastCardProps {
  cast: CastMember;
}

const CastCard = ({ cast }: CastCardProps) => {
  const profileUrl = getImageUrl(cast.profile_path, "w200");

  return (
    <View style={styles.container}>
      {profileUrl ? (
        <Image
          source={{ uri: profileUrl }}
          style={styles.profileImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Image
            source={icons.person}
            style={styles.placeholderIcon}
            tintColor="#A8B5C7"
          />
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>
        {cast.name}
      </Text>
      <Text style={styles.character} numberOfLines={1}>
        {cast.character}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    width: 80,
    alignItems: "center",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    width: 32,
    height: 32,
  },
  name: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  character: {
    color: "#9CA4AB",
    fontSize: 11,
    textAlign: "center",
  },
});

export default CastCard;
