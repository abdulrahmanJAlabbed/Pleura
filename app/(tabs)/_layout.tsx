import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const _layout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      ></Tabs.Screen>

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      ></Tabs.Screen>

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
        }}
      ></Tabs.Screen>

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      ></Tabs.Screen>
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
