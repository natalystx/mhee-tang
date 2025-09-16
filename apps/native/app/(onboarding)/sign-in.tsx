import SignInScreenComponent from "@/features/auth/sign-in";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SignInScreen = () => {
  return (
    <SafeAreaView>
      <SignInScreenComponent />
    </SafeAreaView>
  );
};

export default SignInScreen;
