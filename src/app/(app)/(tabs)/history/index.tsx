import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { defineQuery } from "groq";
import { useUser } from "@clerk/clerk-expo";
import { client } from "@/lib/sanity/client";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Sanity query to fetch user workouts
export const getWorkoutsQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
  _id,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);

export default function Page() {
  const { user } = useUser();
  const [workouts, setWorkouts] = React.useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const onRefresh = () => {
    fetchWorkouts();
  };

  const fetchWorkouts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await client.fetch(getWorkoutsQuery, {
        userId: user.id,
      });
      setWorkouts(response);
      //console.log("Workouts:", response);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getNumberOfExercises = (workout: GetWorkoutsQueryResult[number]) => {
    return workout.exercises?.length || 0;
  };

  const getExerciseNames = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises
        ?.map((exercise) => exercise.exercise?.name)
        .filter(Boolean) || []
    );
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      seconds > 0 ? `${seconds}s` : null,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatWorkoutDate = (date: string) => {
    if (!date) return "No date recorded";
    const workoutDate = new Date(date);
    return workoutDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 pt-6">
      {/* Header Section */}
      <View className="mb-6 bg-white px-5 py-6 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">
          Workout History
        </Text>
        <Text className="text-gray-600 mt-1">
          {workouts.length}{" "}
          {workouts.length === 1 ? "workout completed" : "workouts completed"}
        </Text>
      </View>

      {/* Content Section */}
      <View className="flex-1 px-5 pb-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : workouts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="bg-gray-200 p-4 rounded-full mb-3">
              <FontAwesome5 name="dumbbell" size={40} color="#6B7280" />
            </View>
            <Text className="text-lg font-semibold text-gray-700">
              No workouts yet
            </Text>
            <Text className="text-gray-500 mt-1 text-center mb-4">
              Your completed workouts will appear here.
            </Text>

            <TouchableOpacity
              onPress={onRefresh}
              className="bg-blue-600 px-6 py-3 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const exerciseNames = getExerciseNames(item);
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/history/workout-record",
                      params: { workoutId: item._id },
                    })
                  }
                  className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200 flex-row justify-between items-start"
                >
                  {/* Left Section - Workout Info */}
                  <View className="flex-1 pr-3">
                    {/* Date */}
                    <View className="flex-row items-center mb-2">
                      <Text className="text-gray-800 font-semibold text-base">
                        {formatWorkoutDate(item.date)}
                      </Text>
                    </View>

                    {/* Duration */}
                    <View className="flex-row items-center mb-2">
                      <FontAwesome5 name="clock" size={16} color="#9CA3AF" />
                      <Text className="ml-2 text-gray-500">
                        {item.duration
                          ? formatDuration(item.duration)
                          : "Not recorded"}
                      </Text>
                    </View>

                    {/* Exercises & Sets */}
                    <View className="flex-row items-center gap-3 mb-2">
                      <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-lg">
                        <Text className="text-gray-700 font-medium">
                          {getNumberOfExercises(item)} Exercises
                        </Text>
                      </View>

                      <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-lg">
                        <Text className="text-gray-700 font-medium">
                          {getTotalSets(item)} Sets
                        </Text>
                      </View>
                    </View>

                    {/* Exercise Names */}
                    {exerciseNames.length > 0 && (
                      <View className="mt-1 self-start">
                        <Text className="text-gray-900 font-semibold mb-1">
                          Exercises:
                        </Text>
                        <View className="flex-row flex-wrap">
                          {exerciseNames.map((name, index) => (
                            <Text
                              key={index}
                              className="text-blue-900 bg-blue-100 px-2 py-1 rounded-lg mr-2 mb-2 text-sm"
                            >
                              {name}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Right Section - Icon */}
                  <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name="fitness" size={32} color="blue" />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
