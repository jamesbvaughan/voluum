import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import VolumeSlider from "@/components/VolumeSlider";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.page}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Volume slider</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <VolumeSlider />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingLeft: 16,
    paddingRight: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
