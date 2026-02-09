import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import "./global.css";

const ProtectedRoute = () => {
  const { user, loading, userData } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated but trying to access auth screens
      const inProfileSetup = segments[1] === "profile-setup";
      if (!userData?.name && !inProfileSetup) {
        router.replace("/auth/profile-setup");
      } else if (userData?.name) {
        router.replace("/");
      }
    }
  }, [user, loading, segments, userData]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#030014",
        }}
      >
        <ActivityIndicator size="large" color="#ab8bff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="movies/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
};

const toastConfig = {
  base: ({ text1, text2, type }: any) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: "#1a1a2e",
        borderLeftColor:
          type === "success"
            ? "#4ade80"
            : type === "error"
              ? "#ef4444"
              : "#ab8bff",
        borderLeftWidth: 5,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          },
          android: {
            elevation: 8,
          },
          web: {
            boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.3)",
          },
        }),
      }}
    >
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
        {text1}
      </Text>
      {text2 && (
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
          {text2}
        </Text>
      )}
    </View>
  ),
  success: (props: any) => toastConfig.base({ ...props, type: "success" }),
  error: (props: any) => toastConfig.base({ ...props, type: "error" }),
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedRoute />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
