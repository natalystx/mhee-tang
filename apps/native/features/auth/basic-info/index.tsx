import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Controller } from "react-hook-form";
import { useViewModel } from "./useViewModel";
import { router } from "expo-router";

const BasicInfo = () => {
  const { form, onSubmit, isLoading } = useViewModel();

  const handleSubmit = async () => {
    try {
      await onSubmit();
      Alert.alert(
        "Success",
        "Your basic information has been updated successfully!"
      );
      router.push({
        pathname: "/(dashboard)",
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update your information. Please try again."
      );
    }
  };

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">
            Basic Information
          </Text>
          <Text className="text-muted-foreground">
            Please provide your basic information to complete your profile.
          </Text>
        </View>

        <View className="space-y-6">
          {/* English Name Field */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              English Name *
            </Text>
            <Controller
              control={form.control}
              name="englishName"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  <TextInput
                    className={`border border-border rounded-lg px-4 py-3 bg-card text-foreground ${
                      error ? "border-destructive" : "border-border"
                    }`}
                    placeholder="Enter your English name"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {error && (
                    <Text className="text-destructive text-sm mt-1">
                      {error.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Thai Name Field */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Thai Name *
            </Text>
            <Controller
              control={form.control}
              name="thaiName"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  <TextInput
                    className={`border border-border rounded-lg px-4 py-3 bg-card text-foreground ${
                      error ? "border-destructive" : "border-border"
                    }`}
                    placeholder="Enter your Thai name"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {error && (
                    <Text className="text-destructive text-sm mt-1">
                      {error.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="mt-8">
          <TouchableOpacity
            className={`rounded-lg px-6 py-4 ${
              isLoading ? "bg-muted" : "bg-primary"
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text
              className={`text-center font-semibold ${
                isLoading ? "text-muted-foreground" : "text-primary-foreground"
              }`}
            >
              {isLoading ? "Updating..." : "Save Information"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Info - Remove in production */}
        {__DEV__ && (
          <View className="mt-8 p-4 bg-muted rounded-lg">
            <Text className="text-xs text-muted-foreground mb-2">
              Debug Info:
            </Text>
            <Text className="text-xs text-muted-foreground">
              Form Valid: {form.formState.isValid ? "Yes" : "No"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Errors: {JSON.stringify(form.formState.errors, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default BasicInfo;
