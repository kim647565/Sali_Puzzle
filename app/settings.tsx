import { Alert } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";
import { Button } from "../src/components/Button";
import { Screen, Tile } from "../src/components/Screen";
import { useAppStore } from "../src/store";
import { colors, text } from "../src/theme";

export default function Settings() {
  const reset = () => Alert.alert("Reset player progress?", "This removes completed levels and best scores for the current player.", [
    { text: "Cancel", style: "cancel" },
    { text: "Reset", style: "destructive", onPress: () => useAppStore.getState().resetProgress() }
  ]);
  return <Screen><Text style={text.title}>Settings</Text><Tile><Text style={text.subheading}>Offline play</Text><Text style={{ ...text.body, color: colors.muted, marginTop: 6 }}>Lessons and puzzles are stored on this device. No internet connection is required.</Text></Tile><Button onPress={() => router.push("/how-to-play")}>Replay how to play</Button><Button variant="secondary" onPress={() => router.replace("/login")}>Switch player</Button><Button variant="quiet" onPress={reset}>Reset current progress</Button><Text style={{ color: colors.muted, textAlign: "center" }}>Sali Puzzle · Version 1.0.0</Text></Screen>;
}
