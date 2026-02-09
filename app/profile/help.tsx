import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Help() {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "You can reset your password by logging out and clicking 'Forgot Password' on the login screen.",
    },
    {
      question: "How do I download movies?",
      answer:
        "Currently, offline viewing is not supported. Stay tuned for future updates!",
    },
    {
      question: "Can I use Pleura on multiple devices?",
      answer: "Yes, you can sign in to your account on any compatible device.",
    },
  ];

  const handleContact = () => {
    Linking.openURL("mailto:support@pleura.app");
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
        <Text style={styles.headerTitle}>Help & Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity style={styles.contactCard} onPress={handleContact}>
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={24} color="#ab8bff" />
            </View>
            <View>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>Get help via email</Text>
            </View>
            <Ionicons
              name="open-outline"
              size={20}
              color="#666"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    padding: 16,
    borderRadius: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(171, 139, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contactSubtitle: {
    color: "#888",
    fontSize: 14,
  },
  faqItem: {
    backgroundColor: "#1A1A2E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  question: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  answer: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
});
