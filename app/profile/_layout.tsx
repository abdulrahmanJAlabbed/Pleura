import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen
        name="terms"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="privacy"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
