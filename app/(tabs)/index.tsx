import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "cyan",
      }}
    >
      <Text className="text-4xl mt-10 text-purple-700">Welcome to pleura</Text>
    </View>
  );
}
