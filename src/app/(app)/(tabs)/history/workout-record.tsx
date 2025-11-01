import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function workoutRecord() {
  const { workoutId } = useLocalSearchParams /* <{workoutId: string}> */();

  return (
    <View>
      <Text>{workoutId}</Text>
    </View>
  );
}
