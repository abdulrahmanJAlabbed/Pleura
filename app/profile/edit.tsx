import { storage } from "@/configs/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Avatar images from assets
const AVATAR_IMAGES = [
  { id: 1, key: "avatar_1", source: require("@/assets/avatars/1.png") },
  { id: 2, key: "avatar_2", source: require("@/assets/avatars/2.jpg") },
  { id: 3, key: "avatar_3", source: require("@/assets/avatars/3.jpg") },
  { id: 4, key: "avatar_4", source: require("@/assets/avatars/4.png") },
  { id: 5, key: "avatar_5", source: require("@/assets/avatars/5.png") },
  { id: 6, key: "avatar_6", source: require("@/assets/avatars/6.png") },
  { id: 7, key: "avatar_7", source: require("@/assets/avatars/7.png") },
  { id: 8, key: "avatar_8", source: require("@/assets/avatars/8.png") },
  { id: 9, key: "avatar_9", source: require("@/assets/avatars/9.png") },
  { id: 10, key: "avatar_10", source: require("@/assets/avatars/10.png") },
  { id: 11, key: "avatar_11", source: require("@/assets/avatars/11.png") },
  { id: 12, key: "avatar_12", source: require("@/assets/avatars/12.png") },
];

// Get avatar source from key or URL
const getAvatarSource = (avatarKey: string) => {
  if (avatarKey?.startsWith("http")) {
    return { uri: avatarKey };
  }
  const avatar = AVATAR_IMAGES.find((a) => a.key === avatarKey);
  return avatar?.source || null;
};

export default function EditProfile() {
  const { userData, user, updateUserProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(userData?.name || "");
  const [surname, setSurname] = useState(userData?.surname || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    userData?.avatar || "avatar_1",
  );
  const [loading, setLoading] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const currentAvatarSource = getAvatarSource(selectedAvatar);
  const initials =
    name && surname
      ? `${name[0]}${surname[0]}`.toUpperCase()
      : name
        ? name[0].toUpperCase()
        : "U";

  // Upload image to Firebase Storage
  const uploadImage = async (uri: string) => {
    if (!user) return null;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `avatars/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Please allow access to your photos to change your avatar.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomImage(result.assets[0].uri);
      // Clear preset avatar when custom image is selected
      setSelectedAvatar("");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Name is required",
      });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        let avatarToSave = selectedAvatar;

        // If custom image is selected, upload it
        if (customImage) {
          const downloadURL = await uploadImage(customImage);
          if (downloadURL) {
            avatarToSave = downloadURL;
          }
        }

        // Add timeout to prevent infinite loading when offline
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Save timed out. Check your connection.")),
            20000, // Increased timeout for upload
          ),
        );

        await Promise.race([
          updateUserProfile({
            name,
            surname,
            avatar: avatarToSave,
          }),
          timeoutPromise,
        ]);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarKey: string) => {
    setSelectedAvatar(avatarKey);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Preview with Edit Button */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarPreview}>
            {customImage ? (
              <Image
                source={{ uri: customImage }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : currentAvatarSource ? (
              <Image
                source={currentAvatarSource}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            {/* Edit overlay button */}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.editHint}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Enter last name"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Avatar Selection */}
        <Text style={styles.sectionTitle}>Choose Avatar</Text>
        <View style={styles.gridContainer}>
          {AVATAR_IMAGES.map((avatar) => (
            <TouchableOpacity
              key={avatar.id}
              style={[
                styles.gridItem,
                selectedAvatar === avatar.key && styles.selectedGridItem,
              ]}
              onPress={() => handleAvatarSelect(avatar.key)}
            >
              <Image
                source={avatar.source}
                style={styles.miniAvatar}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarPreview: {
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
  form: {
    gap: 20,
    marginBottom: 30,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 40,
    justifyContent: "center",
  },
  gridItem: {
    padding: 4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedGridItem: {
    borderColor: "#ab8bff",
  },
  miniAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  saveButton: {
    backgroundColor: "#ab8bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editOverlay: {
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
  },
  editHint: {
    color: "#888",
    fontSize: 13,
    marginTop: 8,
  },
});
