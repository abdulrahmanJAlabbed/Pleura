import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Avatar images mapping
const AVATAR_IMAGES: Record<string, any> = {
  avatar_1: require("@/assets/avatars/1.png"),
  avatar_2: require("@/assets/avatars/2.jpg"),
  avatar_3: require("@/assets/avatars/3.jpg"),
  avatar_4: require("@/assets/avatars/4.png"),
  avatar_5: require("@/assets/avatars/5.png"),
  avatar_6: require("@/assets/avatars/6.png"),
  avatar_7: require("@/assets/avatars/7.png"),
  avatar_8: require("@/assets/avatars/8.png"),
  avatar_9: require("@/assets/avatars/9.png"),
  avatar_10: require("@/assets/avatars/10.png"),
  avatar_11: require("@/assets/avatars/11.png"),
  avatar_12: require("@/assets/avatars/12.png"),
};

// Get avatar image source from avatar string
const getAvatarSource = (avatarString: string) => {
  if (avatarString?.startsWith("http")) {
    return { uri: avatarString };
  }
  if (avatarString && AVATAR_IMAGES[avatarString]) {
    return AVATAR_IMAGES[avatarString];
  }
  return null;
};

export default function Profile() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // AuthProvider will handle redirect
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const avatarSource = getAvatarSource(userData?.avatar || "");
  const initials =
    userData?.name && userData?.surname
      ? `${userData.name[0]}${userData.surname[0]}`.toUpperCase()
      : userData?.name
        ? userData.name[0].toUpperCase()
        : "U";

  // Mock Stats
  const stats = [
    { label: "My List", value: userData?.myList?.length || 0 },
    { label: "Reviews", value: 0 },
    { label: "Watched", value: 0 },
  ];

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      action: () => {
        if (userData?.isGuest) {
          Toast.show({
            type: "error",
            text1: "Restricted",
            text2: "Verify your phone number to edit profile.",
          });
          return;
        }
        router.push("/profile/edit");
      },
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      action: () => router.push("/profile/notifications"),
    },
    {
      icon: "settings-outline",
      label: "App Settings",
      action: () => router.push("/profile/settings"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Feedback",
      action: () => router.push("/profile/help"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {/* Avatar Image or Initials Fallback */}
            <View style={styles.avatar}>
              {avatarSource ? (
                <Image
                  source={avatarSource}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
          </View>
          <Text style={styles.name}>
            {userData?.name || "Guest User"} {userData?.surname || ""}
          </Text>
          <Text style={styles.email}>{user?.email || "No email linked"}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={22} color="#ab8bff" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030014",
  },
  scrollContent: {
    paddingBottom: 40,
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
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#1A1A2E",
    overflow: "hidden",
    backgroundColor: "#333",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 1,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ab8bff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#030014",
    zIndex: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#888",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: "#1A1A2E",
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  menuContainer: {
    marginHorizontal: 20,
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 16,
    borderRadius: 16,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(171, 139, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 40,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.2)",
  },
  logoutText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#444",
    marginTop: 20,
    fontSize: 12,
  },
});
