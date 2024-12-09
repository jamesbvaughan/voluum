import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useSettings } from "@/hooks/useSettings";

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
  const { speakerIpAddress, maxVolume } = useSettings();

  const [volume, setVolume] = useState<number | null>(null);

  useEffect(() => {
    if (speakerIpAddress == null) {
      return undefined;
    }

    async function updateVolume() {
      if (speakerIpAddress == null) {
        return;
      }

      const currentVolume =
        await getCurrentVolumeFromSpeakers(speakerIpAddress);
      setVolume(currentVolume);
    }

    updateVolume();
    const interval = setInterval(updateVolume, UPDATE_INTERVAL_SECONDS * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [speakerIpAddress]);

  const handleVolumeChange = async (value: number) => {
    if (volume == null || speakerIpAddress == null) {
      return;
    }

    const volumeBefore = volume;
    setVolume(value);

    try {
      postVolumeToSpeakers(speakerIpAddress, value);
    } catch (error) {
      setVolume(volumeBefore);
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      {speakerIpAddress == null ? (
        <Text style={styles.label}>Add a speaker in the settings</Text>
      ) : volume == null ? (
        <Text style={styles.label}>Loading current volume....</Text>
      ) : (
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={maxVolume}
          step={1}
          value={volume}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbImage={require("./slider-90.png")}
          trackImage={require("./track-90.png")}
          inverted
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
    color: "white",
    fontSize: 20,
  },
  slider: {
    transform: [{ rotate: "-90deg" }], // Rotate the slider to make it vertical
    width: 600,
    height: 69,
  },
});

export default VolumeSlider;
