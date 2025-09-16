import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Controller } from "react-hook-form";
import { useViewModel } from "./useViewModel";

const SignInScreenComponent = () => {
  const { control, handleSubmit } = useViewModel();

  return (
    <View className="flex px-6 h-full w-full">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back
        </Text>
        <Text className="text-gray-600">Sign in to your account</Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 text-base font-medium mb-2">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <TextInput
              style={{ height: 40, padding: 5 }}
              placeholder="Type here to translate!"
              onChangeText={(text) => onChange(text.toLowerCase())}
              value={value}
              onBlur={onBlur}
              keyboardType="email-address"
            />
          )}
        />
      </View>

      <Pressable
        className="bg-blue-200 rounded-lg py-4 mb-4 w-full h-20"
        onPress={handleSubmit}
      >
        <Text className="text-black text-center text-base font-semibold">
          Send OTP
        </Text>
      </Pressable>
    </View>
  );
};

export default SignInScreenComponent;
