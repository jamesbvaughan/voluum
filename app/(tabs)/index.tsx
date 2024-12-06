import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import VolumeSlider from "@/components/VolumeSlider";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.page}>
      <ThemedText type="title">Volume slider</ThemedText>

      <VolumeSlider />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 96,
    paddingLeft: 16,
    paddingRight: 16,
    height: "100%",
  },
});
