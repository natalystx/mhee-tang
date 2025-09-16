import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Controller } from "react-hook-form";
import { useViewModel } from "./useViewModel";

const VerifyOTPScreenComponent = () => {
  const { control, handleSubmit, errors, email, resendOTP } = useViewModel();

  return (
    <KeyboardAvoidingView
      className="bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-6 justify-center w-full h-full">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Enter verification code
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            We've sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-blue-600">{email}</Text>
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-base font-medium text-gray-700 mb-2 text-center">
            Enter OTP
          </Text>
          <Controller
            control={control}
            name="otp"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View>
                <TextInput
                  className={`border rounded-lg px-4 py-4 text-2xl font-semibold text-center tracking-widest ${
                    error ? "border-red-500" : "border-gray-300"
                  } bg-white`}
                  placeholder="Enter 6-digit code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={6}
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  autoCorrect={false}
                />
                {error && (
                  <Text className="text-red-500 text-sm mt-2 text-center">
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 mb-6"
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold text-center">
            Verify Code
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">
            Didn't receive the code?{" "}
          </Text>
          <TouchableOpacity onPress={resendOTP}>
            <Text className="text-blue-600 text-sm font-medium">Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTPScreenComponent;
