import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface EmbedPlayerProps {
  url: string;
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ url }) => {
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          sandbox="allow-forms allow-scripts allow-same-origin allow-presentation allow-popups"
          referrerPolicy="no-referrer"
        />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      style={styles.webview}
      allowsFullscreenVideo
      javaScriptEnabled
      domStorageEnabled
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState
      // Prevent external redirects
      setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={(request) => {
        // Allow the initial load
        if (request.url === url) return true;

        // Block all navigation types that are 'click' (user interaction)
        // This effectively stops ads that try to open on click
        if (request.navigationType === "click") {
          return false;
        }

        // Allow other types (like subframes loading)
        return true;
      }}
      // Block window.open calls from JS
      injectedJavaScript={`
        window.open = function() { return null; };
        true;
      `}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default EmbedPlayer;
