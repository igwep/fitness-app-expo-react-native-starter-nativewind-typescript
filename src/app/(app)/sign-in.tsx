import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { platform } from "os";
import GoogleSignIn from "./components/GoogleSignIn";
import { Alert } from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both your email address and password.",
        [{ text: "OK" }]
      );
      return; // stop execution
    }
    setIsLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Only wrap scrollable form content */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingBottom: 4,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Ionicons name="fitness" size={50} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              FitTracker
            </Text>
            <Text className="text-lg  text-gray-400 text-center">
              Track your fitness journey{"\n"}and reach your goals
            </Text>
          </View>

          {/* FORM CARD */}
          <View className="shadow-sm rounded-2xl bg-white p-8 w-full mb-6">
            <Text className="text-3xl text-center py-4 font-bold">
              Welcome Back
            </Text>

            <Text className="text-lg font-semibold mb-2 text-gray-400">
              Email
            </Text>
            <View className="flex-row items-center border border-gray-300 bg-gray-50 rounded-lg p-3 mb-4 w-full">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                onChangeText={setEmailAddress}
                className="flex-1 ml-2 text-gray-800 placeholder:text-gray-300"
                editable={!isLoading}
              />
            </View>

            <Text className="text-lg font-semibold mb-2 text-gray-400">
              Password
            </Text>
            <View className="flex-row items-center border border-gray-300 bg-gray-50 rounded-lg p-3 w-full">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={password}
                placeholder="Enter password"
                secureTextEntry
                onChangeText={setPassword}
                className="flex-1 ml-2 text-gray-800 placeholder:text-gray-300"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            onPress={onSignInPress}
            disabled={isLoading}
            className="bg-blue-600 py-4 w-full rounded-lg flex-row justify-center items-center mb-4"
          >
            <Ionicons name="log-in-outline" size={22} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center my-4 w-full">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 mx-3">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          <GoogleSignIn />
          <View className="w-full flex justify-center items-center flex-row mt-4">
            <Text className="text-gray-600">Don’t have an account? </Text>
            <Link href="/sign-up">
              <Text className="text-blue-600 font-semibold">Sign up</Text>
            </Link>
          </View>
        </ScrollView>
        {/* Fixed footer OUTSIDE the KeyboardAvoidingView */}
        <View className="flex-row justify-center py-4 border-t border-gray-200 bg-gray-100">
          <Text className="text-gray-400">
            {" "}
            Start your fitness Journey Today
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
