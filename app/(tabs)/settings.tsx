import { Alert, Button, FlatList, StyleSheet, TextInput } from "react-native";
import Zeroconf, { Service } from "react-native-zeroconf";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/hooks/useSettings";

const zeroconf = new Zeroconf();

function IpAddressConfig() {
  const savedIpAddress = useSettings((s) => s.speakerIpAddress);
  const [ipAddress, setIpAddress] = useState(savedIpAddress);

  const saveIpAddress = async () => {
    if (ipAddress == null || ipAddress === "") {
      return;
    }

    try {
      await AsyncStorage.setItem("speakerIpAddress", ipAddress);
      useSettings.setState({ speakerIpAddress: ipAddress });
      Alert.alert("Success", "IP address saved!");
    } catch (error) {
      console.error("Failed to save IP address:", error);
      Alert.alert("Error", "Failed to save IP address.");
    }
  };

  const [devices, setDevices] = useState<Service[]>([]);

  useEffect(() => {
    // TODO implement the timeouts and edge case handling from
    // https://github.com/balthazar/react-native-zeroconf/blob/master/example/App.tsx

    zeroconf.on("resolved", (device) => {
      console.log("Resolved device:", device);
      setDevices((prevDevices) => [...prevDevices, device]);
    });

    zeroconf.on("error", (err) => {
      console.error("Zeroconf error:", err);
      Alert.alert("Error", "Failed to search for devices.");
    });

    return () => {
      if (zeroconf) {
        zeroconf.stop();
      }
    };
  }, []);

  const startDiscovery = () => {
    if (zeroconf == null) {
      console.error("Zeroconf is not initialized");
    }

    setDevices([]); // Clear previous devices
    zeroconf.scan(); // Start scanning for devices
  };

  return (
    <ThemedView>
      <ThemedText style={styles.label}>Set Speaker IP Address:</ThemedText>
      <TextInput
        style={styles.input}
        value={ipAddress ?? ""}
        onChangeText={setIpAddress}
        placeholder="Enter IP or domain name"
        keyboardType="url"
        autoCapitalize="none"
      />
      <Button title="Save IP Address" onPress={saveIpAddress} />

      <Button title="Search for Speakers" onPress={startDiscovery} />
      <FlatList
        data={devices}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <Button
            title={item.name}
            onPress={() => {
              setIpAddress(item.addresses[0]);
            }}
          />
        )}
      />
    </ThemedView>
  );
}

function MaxVolumeConfig() {
  const savedMaxVolume = useSettings((s) => s.maxVolume);
  const [maxVolume, setMaxVolume] = useState(savedMaxVolume);

  async function saveMaxVolume() {
    try {
      await AsyncStorage.setItem("maxVolume", maxVolume.toString());
      useSettings.setState({ maxVolume });
      Alert.alert("Success", "Max volume saved!");
    } catch (error) {
      console.error("Failed to save max volume:", error);
      Alert.alert("Error", "Failed to save max volume setting.");
    }
  }

  return (
    <ThemedView>
      <ThemedText style={styles.label}>Max volume</ThemedText>
      <TextInput
        style={styles.input}
        value={maxVolume.toString()}
        onChangeText={(newVolumeString) => {
          const newVolume = parseInt(newVolumeString, 10);
          if (isNaN(newVolume)) {
            return;
          }

          setMaxVolume(newVolume);
        }}
        placeholder="Enter a max volume level (1-100)"
        keyboardType="numeric"
      />
      <Button title="Save max volume" onPress={saveMaxVolume} />
    </ThemedView>
  );
}

export default function SettingsTabScreen() {
  return (
    <ThemedView style={styles.page}>
      <ThemedText type="title">Settings</ThemedText>

      <IpAddressConfig />
      <MaxVolumeConfig />
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
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  label: {
    fontSize: 18,
    marginTop: 16,
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  device: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 4,
  },
  deviceText: {
    fontSize: 16,
  },
  searchButton: {
    color: "#1EB1FC",
  },
});
