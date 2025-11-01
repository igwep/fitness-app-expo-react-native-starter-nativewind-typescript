import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { Exercise } from "@/lib/sanity/types";
import ExerciseCard from "../components/ExerciseCard";

export const exerciseQuery = defineQuery(`*[_type == "exercise"] {
  ...
}`);

export default function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const router = useRouter();

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await client.fetch(exerciseQuery);
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="mb-4 bg-white px-5 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Exercise Library
        </Text>
        <Text className="text-gray-500 text-base mt-1">
          Discover and master new exercises
        </Text>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-3 py-2 flex-row items-center mt-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-gray-800 text-base ml-2"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-3 text-base">
            Loading exercises...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
          renderItem={({ item }) => (
            <ExerciseCard
              items={item}
              onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
              title="Pull to refresh exercises"
              titleColor="#2563EB"
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons
                name={
                  searchQuery.length > 0 ? "search-outline" : "fitness-outline"
                }
                size={50}
                color="#9CA3AF"
              />
              <Text className="text-lg font-semibold text-gray-700 mt-4">
                {searchQuery.length > 0
                  ? `No results found for “${searchQuery}”`
                  : "No exercises available"}
              </Text>
              <Text className="text-gray-500 text-sm mt-1 text-center px-10">
                {searchQuery.length > 0
                  ? "Try a different search keyword."
                  : "Pull to refresh or add new exercises."}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
