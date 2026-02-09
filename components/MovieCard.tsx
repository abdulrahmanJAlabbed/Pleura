import { icons } from "@/constants/icons";
import { getImageUrl } from "@/services/tmdb";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MovieCardProps {
  movie: Movie;
  onPress?: (movie: Movie) => void;
}

const MovieCard = ({ movie, onPress }: MovieCardProps) => {
  const posterUrl = getImageUrl(movie.poster_path, "w300");
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <Link href={`/movies/${movie.id}`} asChild>
      <TouchableOpacity
        className="w-[30%] mb-4"
        activeOpacity={0.7}
        onPress={() => onPress?.(movie)}
      >
        <View className="relative">
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-52 rounded-lg"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-52 rounded-lg bg-dark-200 items-center justify-center">
              <Image
                source={icons.person}
                className="w-10 h-10"
                tintColor="#A8B5C7"
              />
            </View>
          )}

          {/* Rating Badge */}
          <View className="absolute bottom-1 left-1 bg-dark-100/80 px-1.5 py-0.5 rounded flex-row items-center">
            <Image
              source={icons.star}
              className="w-3 h-3 mr-1"
              tintColor="#FBBF24"
            />
            <Text className="text-white text-xs font-bold">
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text className="text-white text-sm font-medium mt-2" numberOfLines={1}>
          {movie.title}
        </Text>
        <Text className="text-light-300 text-xs">{releaseYear}</Text>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
