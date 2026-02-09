import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  { id: 1, source: require("@/assets/avatars/1.png") },
  { id: 2, source: require("@/assets/avatars/2.jpg") },
  { id: 3, source: require("@/assets/avatars/3.jpg") },
  { id: 4, source: require("@/assets/avatars/4.png") },
  { id: 5, source: require("@/assets/avatars/5.png") },
  { id: 6, source: require("@/assets/avatars/6.png") },
  { id: 7, source: require("@/assets/avatars/7.png") },
  { id: 8, source: require("@/assets/avatars/8.png") },
  { id: 9, source: require("@/assets/avatars/9.png") },
  { id: 10, source: require("@/assets/avatars/10.png") },
  { id: 11, source: require("@/assets/avatars/11.png") },
  { id: 12, source: require("@/assets/avatars/12.png") },
];

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loading, setLoading] = useState(false);

  const { updateUserProfile } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim() || !surname.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your name and surname",
      });
      return;
    }

    try {
      setLoading(true);
      const avatarId = AVATAR_IMAGES[selectedAvatar].id;
      await updateUserProfile({
        name,
        surname,
        avatar: `avatar_${avatarId}`, // Store avatar ID reference
      });
      // Navigate to main app
      router.replace("/");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Finish Setup</Text>
        <Text style={styles.subtitle}>Personalize your profile</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#666"
              value={surname}
              onChangeText={setSurname}
            />
          </View>

          <View style={styles.avatarSection}>
            <Text style={styles.label}>Choose an Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_IMAGES.map((avatar, index) => (
                <TouchableOpacity
                  key={avatar.id}
                  onPress={() => setSelectedAvatar(index)}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === index && styles.selectedAvatar,
                  ]}
                >
                  <Image
                    source={avatar.source}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  {selectedAvatar === index && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Watching</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030014",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 32,
  },
  form: {
    gap: 24,
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
  avatarSection: {
    gap: 12,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedAvatar: {
    borderColor: "#ab8bff",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  checkMark: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#ab8bff",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#030014",
  },
  checkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ab8bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
