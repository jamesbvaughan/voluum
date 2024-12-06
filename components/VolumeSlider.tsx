import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: make this configurable
const MAX_VOLUME = 30;
const UPDATE_INTERVAL_SECONDS = 10;

async function getCurrentVolumeFromSpeakers(speakerIpAddress: string) {
  const getVolumeUrl = `http://${speakerIpAddress}/api/getData?path=player:volume&roles=@all`;
  const response = await fetch(getVolumeUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = await response.json();
  const currentVolume = body.value.i32_;
  return currentVolume;
}

async function postVolumeToSpeakers(speakerIpAddress: string, volume: number) {
  if (volume > MAX_VOLUME) {
    console.error("That's too high!", volume);
    return;
  }

  const response = await fetch(`http://${speakerIpAddress}/api/setData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: "player:volume",
      role: "value",
      value: { type: "i32_", i32_: volume },
      _nocache: new Date().getTime(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to set volume");
  }
}

function VolumeSlider() {
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  const [volume, setVolume] = useState<number | null>(null);

  useEffect(() => {
    async function loadIpAddress() {
      try {
        const storedIpAddress = await AsyncStorage.getItem("speakerIpAddress");
        if (storedIpAddress) {
          setIpAddress(storedIpAddress);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load saved IP address.");
      }
    }

    loadIpAddress();
  }, []);

  useEffect(() => {
    if (ipAddress == null) {
      return undefined;
    }

    async function updateVolume() {
      if (ipAddress == null) {
        return;
      }

      const currentVolume = await getCurrentVolumeFromSpeakers(ipAddress);
      setVolume(currentVolume);
    }

    updateVolume();
    const interval = setInterval(updateVolume, UPDATE_INTERVAL_SECONDS * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ipAddress]);

  const handleVolumeChange = async (value: number) => {
    if (volume == null || ipAddress == null) {
      return;
    }

    const volumeBefore = volume;
    setVolume(value);

    try {
      postVolumeToSpeakers(ipAddress, value);
    } catch (error) {
      setVolume(volumeBefore);
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Volume: {volume}</ThemedText>

      {volume == null ? (
        <ThemedText>Loading current volume....</ThemedText>
      ) : (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={MAX_VOLUME}
          step={1}
          value={volume}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1EB1FC"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  label: {
    fontSize: 20,
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default VolumeSlider;
