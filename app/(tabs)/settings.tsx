import { Alert, Button, FlatList, StyleSheet, TextInput } from "react-native";
import Zeroconf, { Service } from "react-native-zeroconf";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const zeroconf = new Zeroconf();

export default function SettingsTabScreen() {
  const [ipAddress, setIpAddress] = useState("");

  const saveIpAddress = async () => {
    try {
      await AsyncStorage.setItem("speakerIpAddress", ipAddress);
      Alert.alert("Success", "IP address saved!");
    } catch (error) {
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
    <ThemedView style={styles.page}>
      <ThemedText type="title">Settings</ThemedText>

      <ThemedText style={styles.label}>Set Speaker IP Address:</ThemedText>
      <TextInput
        style={styles.input}
        value={ipAddress}
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
