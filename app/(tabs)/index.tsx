import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to pleura</Text>
      <Link href="/search">search</Link>
      <Link href="/[avatar]">avatar</Link>
    </View>
  );
}
