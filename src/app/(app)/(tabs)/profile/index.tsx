import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function Page() {
  const { signOut } = useAuth();
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/sign-in"); //  redirect to your sign-in page
            } catch (err) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
              console.error("Sign-out error:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>
      <TouchableOpacity
        onPress={handleSignOut}
        className="flex-row items-center justify-center bg-red-600 py-3 rounded-lg"
      >
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text className="text-white font-semibold text-lg ml-2">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
