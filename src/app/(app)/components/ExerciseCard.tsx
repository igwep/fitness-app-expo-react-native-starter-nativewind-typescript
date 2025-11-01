import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Exercise } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/client";

//  Props
interface ExerciseCardProps {
  items: Exercise;
  onPress: () => void;
  showChevron?: boolean;
}

//  Get difficulty color
export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "#4CAF50"; // green
    case "intermediate":
      return "#FFC107"; // yellow
    case "advanced":
      return "#F44336"; // red
    default:
      return "#9E9E9E"; // gray fallback
  }
};

//  Get difficulty text
export const getDifficultyText = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
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

export default function ExerciseCard({
  items,
  onPress,
  showChevron = false,
}: ExerciseCardProps) {
  const difficulty = items.difficulty || "unknown";
  const color = getDifficultyColor(difficulty);
  const text = getDifficultyText(difficulty);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl flex-row items-center p-4 mb-4 shadow-md"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3, // for Android shadow
      }}
    >
      {/*  Exercise Image */}
      <Image
        source={{ uri: urlFor(items.image?.asset?._ref).url() }}
        className="w-20 h-20 rounded-lg mr-4"
        resizeMode="cover"
      />

      {/*  Info Section */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
          {items.name}
        </Text>

        <Text
          className="text-sm text-gray-500 mt-1"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {items.description || "No description available."}
        </Text>

        <Text
          className="text-sm font-medium mt-2 text-white px-2 py-1 rounded-full self-start"
          style={{ backgroundColor: color }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
