import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#05111E" } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="proof-handoff" />
      </Stack>
    </SafeAreaProvider>
  );
}
