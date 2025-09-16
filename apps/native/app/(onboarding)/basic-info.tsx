import BasicInfo from "@/features/auth/basic-info";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BasicInfoScreen = () => {
  return (
    <SafeAreaView>
      <BasicInfo />
    </SafeAreaView>
  );
};

export default BasicInfoScreen;
