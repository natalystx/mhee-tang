import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import React from "react";
import { Text } from "react-native";

const IndexScreen = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Text></Text>;
  }

  if (!user) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!user?.name) {
    return <Redirect href="/(onboarding)/basic-info" />;
  }

  return <Redirect href="/(onboarding)" />;
};

export default IndexScreen;
