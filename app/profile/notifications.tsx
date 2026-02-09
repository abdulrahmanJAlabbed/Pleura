import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications() {
  const router = useRouter();
  const [newArrivals, setNewArrivals] = useState(true);
  const [myListUpdates, setMyListUpdates] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>New Arrivals</Text>
            <Text style={styles.settingDescription}>
              Get notified about new movies and shows.
            </Text>
          </View>
          <Switch
            value={newArrivals}
            onValueChange={setNewArrivals}
            trackColor={{ false: "#333", true: "#ab8bff" }}
            thumbColor={"#fff"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>My List Updates</Text>
            <Text style={styles.settingDescription}>
              Notify me when items in my list change.
            </Text>
          </View>
          <Switch
            value={myListUpdates}
            onValueChange={setMyListUpdates}
            trackColor={{ false: "#333", true: "#ab8bff" }}
            thumbColor={"#fff"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>App Updates</Text>
            <Text style={styles.settingDescription}>
              Receive updates about the application features.
            </Text>
          </View>
          <Switch
            value={appUpdates}
            onValueChange={setAppUpdates}
            trackColor={{ false: "#333", true: "#ab8bff" }}
            thumbColor={"#fff"}
          />
        </View>
      </View>
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
    gap: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    padding: 16,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#888",
    fontSize: 12,
  },
});
