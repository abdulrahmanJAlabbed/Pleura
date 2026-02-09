import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export type ContentType = "movies" | "tv" | "anime";

interface ContentTabsProps {
  activeTab: ContentType;
  onTabChange: (tab: ContentType) => void;
}

const TABS: { key: ContentType; label: string; emoji: string }[] = [
  { key: "movies", label: "Movies", emoji: "🎬" },
  { key: "tv", label: "TV Shows", emoji: "📺" },
  { key: "anime", label: "Anime", emoji: "🎌" },
];

const ContentTabs = ({ activeTab, onTabChange }: ContentTabsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{tab.emoji}</Text>
          <Text
            style={[styles.label, activeTab === tab.key && styles.activeLabel]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1A1A2E",
  },
  activeTab: {
    backgroundColor: "#ab8bff",
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    color: "#A8B5C7",
    fontSize: 14,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#fff",
  },
});

export default ContentTabs;
