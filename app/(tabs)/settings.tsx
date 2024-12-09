import { Alert, Button, FlatList, StyleSheet, TextInput } from "react-native";
import Zeroconf, { Service } from "react-native-zeroconf";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useRef, useState } from "react";
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

  const [devices, setDevices] = useState<Record<string, Service>>({});
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    zeroconf.on("resolved", (device) => {
      console.log("Resolved device:", device);
      setDevices((prevDevices) => ({ ...prevDevices, [device.host]: device }));
    });

    zeroconf.on("error", (err) => {
      console.error("Zeroconf error:", err);
      Alert.alert("Error", "Failed to search for devices.");
    });

    zeroconf.on("stop", () => {
      setIsScanning(false);
    });
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startDiscovery = () => {
    if (isScanning) {
      return;
    }

    setDevices({}); // Clear previous devices
    setIsScanning(true);
    zeroconf.scan(); // Start scanning for devices

    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      zeroconf.stop();
    }, 5000);
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
      {isScanning && (
        <ThemedText style={styles.label}>Searching for devices...</ThemedText>
      )}
      <FlatList
        data={Object.values(devices)}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <Button
            title={item.name}
            onPress={() => {
              setIpAddress(item.addresses[0]);
              zeroconf.stop();
            }}
          />
        )}
      />
    </ThemedView>
  );
}

function MaxVolumeConfig() {
  const savedMaxVolume = useSettings((s) => s.maxVolume);
  const [maxVolumeInputValue, setMaxVolumeInputValue] = useState(
    savedMaxVolume.toString(),
  );

  async function saveMaxVolume() {
    const maxVolumeNumber = parseInt(maxVolumeInputValue, 10);
    if (
      isNaN(maxVolumeNumber) ||
      maxVolumeNumber < 1 ||
      maxVolumeNumber > 100
    ) {
      Alert.alert(
        "Error",
        "Invalid max volume level. Please enter a number between 1 and 100.",
      );
      return;
    }

    try {
      await AsyncStorage.setItem("maxVolume", maxVolumeNumber.toString());
      useSettings.setState({ maxVolume: maxVolumeNumber });
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
        value={maxVolumeInputValue}
        onChangeText={(newVolumeString) => {
          setMaxVolumeInputValue(newVolumeString);
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
    color: "white",
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
