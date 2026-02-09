import { Ionicons } from "@expo/vector-icons";
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

export default function TermsOfService() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          Welcome to Pleura. By using our application, you agree to these Terms
          of Service.
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using our service, you agree to be bound by these
          terms. If you disagree with any part of the terms, you may not access
          the service.
        </Text>

        <Text style={styles.heading}>2. Use License</Text>
        <Text style={styles.paragraph}>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on Pleura's app for personal,
          non-commercial transitory viewing only.
        </Text>

        <Text style={styles.heading}>3. Disclaimer</Text>
        <Text style={styles.paragraph}>
          The materials on Pleura's app are provided on an 'as is' basis. Pleura
          makes no warranties, expressed or implied, and hereby disclaims and
          negates all other warranties including, without limitation, implied
          warranties or conditions of merchantability, fitness for a particular
          purpose, or non-infringement of intellectual property or other
          violation of rights.
        </Text>

        <Text style={styles.heading}>4. Limitations</Text>
        <Text style={styles.paragraph}>
          In no event shall Pleura or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on Pleura's app.
        </Text>
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
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
    marginBottom: 12,
  },
});
