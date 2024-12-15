import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="pokemon" />
    </Stack>
  );
}
