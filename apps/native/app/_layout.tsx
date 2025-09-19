import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { NAV_THEME } from "@/lib/constants";
import React, { useRef } from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Platform } from "react-native";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import "react-native-webcrypto";
import { KeyboardProvider } from "react-native-keyboard-controller";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }
  return (
    <ThemeProvider value={LIGHT_THEME}>
      <StatusBar style={"light"} />
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <GestureHandlerRootView style={{ flex: 1, width: "100%" }}>
          <Stack>
            <Stack.Screen
              name="(onboarding)/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="(onboarding)/sign-in"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(onboarding)/verify-otp"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(onboarding)/basic-info"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(dashboard)/index"
              options={{ headerShown: false }}
            />
          </Stack>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </ThemeProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
