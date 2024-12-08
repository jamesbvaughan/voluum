import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import VolumeSlider from "@/components/VolumeSlider/VolumeSlider";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.page}>
      <VolumeSlider />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    // paddingTop: 96,
    // paddingLeft: 16,
    // paddingRight: 16,
    height: "100%",
    backgroundColor: "#1C1917",
    color: "white",
  },
});
