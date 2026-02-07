import { useLocalSearchParams } from "expo-router/build/hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MovieId = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Movie Name is {id}</Text>
    </View>
  );
};

export default MovieId;

const styles = StyleSheet.create({});
