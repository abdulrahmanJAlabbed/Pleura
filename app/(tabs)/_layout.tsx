import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface TabIconProps {
  focused: boolean;
  icon: any;
  title: string;
}

const TabIcon = ({ focused, icon, title }: TabIconProps) => {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        <Image
          source={icon}
          style={[styles.icon, focused && styles.iconFocused]}
          tintColor={focused ? "#fff" : "#6B6B8D"}
        />
      </View>
      <Text style={[styles.label, focused && styles.labelFocused]}>
        {title}
      </Text>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(15, 13, 35, 0.95)",
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabBarItem: {
    position: "relative",
    height: "100%",
    width: "100%",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    //gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  //iconWrapperFocused: {},
  icon: {
    width: 22,
    height: 22,
  },
  iconFocused: {
    width: 22,
    height: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B6B8D",
    width: "100%",
  },
  labelFocused: {
    color: "#fff",
    fontWeight: "600",
  },
});
