import * as React from "react";
import { useState } from "react";
import {
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import GoogleSignIn from "./components/GoogleSignIn";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  //const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
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

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="mail" size={50} color="white" />
              </View>
              <Text className="text-3xl font-semibold text-gray-900 mb-2">
                Check Your Email
              </Text>
              <Text
                className="text-lg text-wrap px-8 text-gray-400 text-center
            "
              >
                {`We've sent a verification code to ${emailAddress}`}
              </Text>
            </View>
            <View className="bg-white p-8 w-full rounded-xl shadow-sm gap-5">
              <Text className="text-center font-semibold text-2xl">
                Enter Verification Code
              </Text>

              {/* Input section */}
              <View className="gap-2">
                <Text className="text-gray-400 font-semibold">
                  Verification Code
                </Text>

                <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <Ionicons name="key-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    value={code}
                    placeholder="Enter your verification code"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    className="flex-1 ml-2 text-gray-800 placeholder:text-gray-400"
                  />
                </View>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={onVerifyPress}
                className="bg-green-600 py-3 rounded-lg flex-row justify-center items-center gap-2"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#fff"
                />
                <Text className="text-white text-center font-semibold text-lg">
                  Verify Email
                </Text>
              </TouchableOpacity>

              {/* Resend Section */}
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-500">Didn’t receive the code? </Text>
                <TouchableOpacity /* onPress={onResendPress} */>
                  <Text className="text-blue-600 font-semibold">Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View className="flex-row justify-center py-4 border-t border-gray-200 bg-gray-100">
            <Text className="text-gray-400">
              {" "}
              Almost there! Just one more step
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Keyboard handling */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Scrollable content */}
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
              Join FitTracker
            </Text>
            <Text className="text-lg text-gray-400 text-center">
              Join FitTracker today{"\n"}and start your journey
            </Text>
          </View>

          {/* FORM CARD */}
          <View className="shadow-sm rounded-2xl bg-white p-8 w-full mb-6">
            <Text className="text-3xl text-center py-4 font-semibold">
              Create Your Account
            </Text>

            {/* Full Name */}
            {/*  <Text className="text-lg font-semibold mb-2 text-gray-400">
              Full Name
            </Text>
            <View className="flex-row items-center border border-gray-300 bg-gray-50 rounded-lg p-3 mb-4 w-full">
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={fullName}
                placeholder="Enter full name"
                onChangeText={setFullName}
                className="flex-1 ml-2 text-gray-800 placeholder:text-gray-300"
                editable={!isLoading}
              />
            </View> */}

            {/* Email */}
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

            {/* Password */}
            <Text className="text-lg font-semibold mb-2 text-gray-400">
              Password
            </Text>
            <View className="flex-row items-center border border-gray-300 bg-gray-50 rounded-lg p-3 mb-2 w-full">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={password}
                placeholder="Enter password"
                secureTextEntry={!showPassword} // <-- Toggle visibility
                onChangeText={setPassword}
                className="flex-1 ml-2 text-gray-800 placeholder:text-gray-300"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500 mb-4 ml-1">
              Must be at least 8 characters
            </Text>

            {/* Confirm Password */}
            {/* <Text className="text-lg font-semibold mb-2 text-gray-400">
              Confirm Password
            </Text>
            <View className="flex-row items-center border border-gray-300 bg-gray-50 rounded-lg p-3 w-full">
              <Ionicons name="lock-open-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={confirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                onChangeText={setConfirmPassword}
                className="flex-1 ml-2 text-gray-800 placeholder:text-gray-300"
                editable={!isLoading}
              />
            </View> */}
            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={isLoading}
              className="bg-blue-600 py-4 w-full rounded-lg flex-row justify-center items-center mb-4"
            >
              <Ionicons name="person-add-outline" size={22} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                {isLoading ? "Creating Account" : "Create Account"}
              </Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>

          {/* BUTTONS */}

          <View className="flex-row items-center my-4 w-full">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 mx-3">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <GoogleSignIn />

          {/* Sign In link */}
          <View className="w-full flex justify-center items-center flex-row mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/sign-in">
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </Link>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="flex-row justify-center py-4 border-t border-gray-200 bg-gray-100">
          <Text className="text-gray-400">
            Begin your fitness journey today 💪
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
