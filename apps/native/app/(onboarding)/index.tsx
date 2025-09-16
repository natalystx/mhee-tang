import { authClient } from "@/lib/auth";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  return (
    <SafeAreaView className="w-full h-full bg-background flex flex-1">
      <View className="w-full bg-red-100 flex justify-between items-center grow-1 h-full">
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-2xl font-bold text-black mb-2 text-center">
            Welcome to the App!
          </Text>
        </View>
        <View className="w-full p-6">
          <Link
            href="/(onboarding)/sign-in"
            className="w-full h-16 bg-red-500 flex justify-center items-center rounded-lg"
          >
            <Text className="text-lg font-medium text-black">Get Started</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
