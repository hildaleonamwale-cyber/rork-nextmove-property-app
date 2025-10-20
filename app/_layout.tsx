import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserModeProvider } from "@/contexts/UserModeContext";
import { AgentProfileProvider } from "@/contexts/AgentProfileContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { BookingProvider } from "@/contexts/BookingContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="agent/onboarding" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="agent/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="agent/edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="agent/add-property" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="advanced-search" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="agent/calendar" options={{ headerShown: false }} />
      <Stack.Screen name="agent/staff" options={{ headerShown: false }} />
      <Stack.Screen name="account/personal-info" options={{ headerShown: false }} />
      <Stack.Screen name="account/saved" options={{ headerShown: false }} />
      <Stack.Screen name="account/preferences" options={{ headerShown: false }} />
      <Stack.Screen name="account/privacy" options={{ headerShown: false }} />
      <Stack.Screen name="account/help" options={{ headerShown: false }} />
      <Stack.Screen name="account/terms" options={{ headerShown: false }} />
      <Stack.Screen name="account/payment" options={{ headerShown: false }} />
      <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="admin/banners" options={{ headerShown: false }} />
      <Stack.Screen name="admin/sections" options={{ headerShown: false }} />
      <Stack.Screen name="admin/users" options={{ headerShown: false }} />
      <Stack.Screen name="admin/properties" options={{ headerShown: false }} />
      <Stack.Screen name="admin/moderation" options={{ headerShown: false }} />
      <Stack.Screen name="admin/settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuperAdminProvider>
        <UserModeProvider>
          <AgentProfileProvider>
            <BookingProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </BookingProvider>
          </AgentProfileProvider>
        </UserModeProvider>
      </SuperAdminProvider>
    </QueryClientProvider>
  );
}
