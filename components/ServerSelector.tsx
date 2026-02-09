import { SERVER_NAMES, STREAMING_SERVERS } from "@/services/tmdb";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ServerSelectorProps {
  movieId?: number;
  selectedServer?: string;
  onSelect?: (server: string) => void;
}

type ServerKey = keyof typeof STREAMING_SERVERS;

const ServerSelector = ({
  movieId,
  selectedServer,
  onSelect,
}: ServerSelectorProps) => {
  const [internalServer, setInternalServer] = useState<ServerKey>("autoembed");

  const activeServer = selectedServer || internalServer;

  const handleServerPress = async (serverKey: ServerKey) => {
    if (onSelect) {
      onSelect(serverKey);
    } else {
      setInternalServer(serverKey);
    }

    if (movieId) {
      const url = STREAMING_SERVERS[serverKey](movieId);
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const serverKeys = Object.keys(STREAMING_SERVERS) as ServerKey[];

  return (
    <View className="mt-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {serverKeys.map((serverKey) => (
          <TouchableOpacity
            key={serverKey}
            onPress={() => handleServerPress(serverKey)}
            className={`px-4 py-3 rounded-lg ${
              activeServer === serverKey ? "bg-accent" : "bg-dark-200"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeServer === serverKey ? "text-white" : "text-light-200"
              }`}
            >
              {SERVER_NAMES[serverKey]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ServerSelector;
