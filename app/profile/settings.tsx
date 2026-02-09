import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Settings() {
  const router = useRouter();

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Cache cleared",
            });
          },
        },
      ],
    );
  };

  const sections = [
    {
      title: "General",
      data: [
        { label: "Clear Cache", action: handleClearCache, danger: true },
        { label: "Language", value: "English", action: () => {} },
      ],
    },
    {
      title: "About",
      data: [
        { label: "Version", value: "1.0.0", action: () => {} },
        {
          label: "Terms of Service",
          action: () => router.push("/profile/terms"),
        },
        {
          label: "Privacy Policy",
          action: () => router.push("/profile/privacy"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.label + index}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={item.action}>
            <Text style={[styles.itemLabel, item.danger && styles.dangerText]}>
              {item.label}
            </Text>
            {item.value ? (
              <Text style={styles.itemValue}>{item.value}</Text>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#666" />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030014",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A2E",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    color: "#888",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 20,
    textTransform: "uppercase",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  itemValue: {
    color: "#888",
    fontSize: 14,
  },
  dangerText: {
    color: "#FF5252",
  },
});
