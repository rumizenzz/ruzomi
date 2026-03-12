import { Tabs } from "expo-router";
import { ChartNoAxesColumn, Shield, Wallet, Waypoints } from "lucide-react-native";

import { colors } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: "#071421",
          borderTopColor: "rgba(133, 228, 255, 0.14)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Terminal",
          tabBarIcon: ({ color, size }) => <ChartNoAxesColumn color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="hrs"
        options={{
          title: "HRS",
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Waypoints color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
