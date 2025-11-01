import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Exercise, SingleExerciseQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client, urlFor } from "@/lib/sanity/client";
import * as Linking from "expo-linking";

//  Query for a single exercise
export const singleExerciseQuery =
  defineQuery(`*[_type == "exercise" && _id == $id][0] {
  _id,
  name,
  description,
  difficulty,
  image,
  videoUrl,
  isActive
}`);

//  Helper functions
export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "#4CAF50";
    case "intermediate":
      return "#FFC107";
    case "advanced":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
};

export const getDifficultyText = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return "Unknown";
  }
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<SingleExerciseQueryResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiGuidance, setAiGuidance] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const router = useRouter();

  const getSingleExercise = async () => {
    try {
      setIsLoading(true);
      const data = await client.fetch(singleExerciseQuery, { id });
      setExercise(data);
    } catch (error) {
      console.error("Error fetching exercise:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiGuidance = async () => {
    if (!exercise?.name) return;
    try {
      setIsAiLoading(true);
      setAiGuidance(""); // Clear old result before fetching new
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseName: exercise.name }),
      });
      if (!response.ok) throw new Error("Failed to fetch AI guidance");
      const data = await response.json();
      setAiGuidance(data.result);
    } catch (error) {
      console.error("Error fetching AI guidance:", error);
      setAiGuidance(" Failed to get AI guidance. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    getSingleExercise();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-2">Loading exercise...</Text>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-base">Exercise not found.</Text>
      </SafeAreaView>
    );
  }

  const color = getDifficultyColor(exercise.difficulty || "");
  const text = getDifficultyText(exercise.difficulty || "");

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* X Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4 z-10 p-2 bg-gray-200 rounded-full"
      >
        <Ionicons name="close" size={26} color="#111827" />
      </TouchableOpacity>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero Image */}
        {exercise.image?.asset ? (
          <Image
            source={{ uri: urlFor(exercise.image?.asset?._ref).url() }}
            className="w-full h-60"
            resizeMode="contain"
          />
        ) : (
          <View className="w-full h-56 bg-gray-200 items-center justify-center">
            <Ionicons name="image-outline" size={50} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No image available</Text>
          </View>
        )}

        {/* Info Section */}
        <View className="px-5 mt-6">
          <Text className="text-4xl font-extrabold text-gray-900 leading-tight">
            {exercise.name || "Untitled Exercise"}
          </Text>

          {/* Difficulty Badge */}
          {exercise.difficulty && (
            <Text
              className="text-base font-semibold mt-3 text-white px-3 py-2 rounded-full self-start"
              style={{ backgroundColor: color }}
            >
              {text}
            </Text>
          )}

          {/* Description */}
          <Text className="mt-5 text-2xl font-semibold text-gray-900">
            Description
          </Text>
          <Text className="text-lg text-gray-500 leading-relaxed mt-2">
            {exercise.description || "No description available."}
          </Text>

          {/* Video Tutorial Button */}
          <Text className="mt-5 text-2xl font-semibold text-gray-900">
            Video Tutorial
          </Text>
          <TouchableOpacity
            className="flex-row items-center mt-2 bg-red-500 rounded-2xl px-4 py-3"
            onPress={() => {
              if (exercise.videoUrl) {
                Linking.openURL(exercise.videoUrl);
              } else {
                console.warn("No video tutorial available");
              }
            }}
          >
            <Ionicons name="play-circle" size={45} color="#fff" />
            <View>
              <Text className="ml-3 text-white text-lg font-semibold">
                Watch tutorial
              </Text>
              <Text className="ml-3 text-white text-base">
                Learn proper form
              </Text>
            </View>
          </TouchableOpacity>

          {/* AI Guidance Section */}
          <View className="mt-8">
            <Text className="text-2xl font-semibold text-gray-900 mb-3">
              AI Guidance
            </Text>

            {isAiLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-gray-500 ml-2">
                  Generating guidance...
                </Text>
              </View>
            ) : aiGuidance ? (
              <Text className="text-gray-700 mt-2">{aiGuidance}</Text>
            ) : (
              <Text className="text-gray-500 text-base">
                Tap below to get personalized guidance.
              </Text>
            )}

            {/* Action Buttons (Column layout) */}
            <View className="mt-5 gap-3">
              <TouchableOpacity
                className="bg-gray-900 py-3 rounded-xl items-center"
                onPress={getAiGuidance}
              >
                <Text className="text-white font-semibold text-base">
                  Get AI Guidance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-300 py-3 rounded-xl items-center"
                onPress={() => console.log("Form and Technique")}
              >
                <Text className="text-gray-900 font-semibold text-base">
                  Form and Technique
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
