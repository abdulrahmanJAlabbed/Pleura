import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  onPressIn?: () => void;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  onClear?: () => void;
}

const SearchBar = ({
  placeholder,
  onPressIn,
  value,
  onChangeText,
  autoFocus = false,
  onClear,
}: SearchBarProps) => {
  const hasValue = value && value.length > 0;

  return (
    <View style={styles.container}>
      <Image
        source={icons.search}
        style={styles.searchIcon}
        contentFit="contain"
        tintColor="rgba(255, 255, 255, 0.5)"
      />
      <TextInput
        onPressIn={onPressIn}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        style={styles.input}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        selectionColor="#ab8bff"
        returnKeyType="search"
      />
      {hasValue && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SearchBar;
