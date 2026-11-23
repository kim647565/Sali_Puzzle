import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PuzzleButton, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { Screen } from "../src/components/Screen";
import { useAppStore } from "../src/store";
import { fonts } from "../src/theme";

export default function Login() {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const players = useAppStore((state) => state.players);
  const active = useAppStore((state) => state.player);
  const ready = useAppStore((state) => state.ready);
  const createPlayer = useAppStore((state) => state.createPlayer);
  const setPlayer = useAppStore((state) => state.setPlayer);

  function enter() {
    if (!ready) return;
    if (!nickname.trim()) {
      setError("Enter your nickname to start.");
      return;
    }
    if (!createPlayer(nickname)) {
      setError("That nickname is already in use. Choose another or pick an existing player.");
      return;
    }
    router.dismissTo("/home");
  }

  return <Screen background={puzzle.paper}>
    <Text accessibilityRole="header" style={puzzleText.title}>{active ? "Switch player" : "Who’s solving today?"}</Text>
    <Text style={puzzleText.body}>Each player’s scores and progress stay on this device.</Text>
    {players.length > 0 && <View style={styles.list}>
      <Text style={puzzleText.heading}>Choose a player</Text>
      {players.map((player) => (
        <Pressable key={player.id} accessibilityRole="button" accessibilityState={{ selected: player.id === active?.id }} style={({ pressed }) => [styles.player, pressed && styles.pressed]} onPress={() => {
          setPlayer(player);
          router.dismissTo("/home");
        }}>
          <View style={styles.avatar}><Text style={puzzleText.label}>{[...player.nickname][0]?.toUpperCase()}</Text></View>
          <Text style={[puzzleText.label, styles.name]}>{player.nickname}</Text>
          <Ionicons name={player.id === active?.id ? "checkmark-circle" : "chevron-forward"} size={21} color={puzzle.grape} />
        </Pressable>
      ))}
    </View>}
    <View style={styles.panel}>
      <Text style={puzzleText.heading}>New player</Text>
      <TextInput
        accessibilityLabel="Nickname"
        value={nickname}
        onChangeText={(value) => { setNickname(value); setError(""); }}
        onSubmitEditing={enter}
        placeholder="Enter a nickname"
        placeholderTextColor={puzzle.grape}
        maxLength={24}
        returnKeyType="done"
        autoCapitalize="words"
        style={[styles.input, !!error && styles.invalid]}
      />
      {error !== "" && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <PuzzleButton onPress={enter}>Create player</PuzzleButton>
    </View>
    {active && <PuzzleButton quiet onPress={() => router.dismissTo("/home")}>Back home</PuzzleButton>}
  </Screen>;
}

const styles = StyleSheet.create({
  list: { gap: 7 },
  player: { minHeight: 54, flexDirection: "row", alignItems: "center", padding: 7, gap: 8, borderColor: puzzle.lilac, borderWidth: 1, borderRadius: 11, backgroundColor: puzzle.white },
  name: { flex: 1 },
  avatar: { width: 34, height: 34, borderRadius: 9, backgroundColor: puzzle.sunshine, alignItems: "center", justifyContent: "center" },
  panel: { padding: 15, borderRadius: 17, gap: 9, backgroundColor: puzzle.white },
  input: { borderWidth: 1, borderColor: puzzle.lilac, borderRadius: 10, padding: 11, color: puzzle.ink, fontSize: 16, fontFamily: fonts.body },
  invalid: { borderColor: puzzle.error },
  error: { color: puzzle.error, fontFamily: fonts.body },
  pressed: { opacity: 0.72 },
});
