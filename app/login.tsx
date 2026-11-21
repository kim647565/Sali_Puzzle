import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { Button } from "../src/components/Button";
import { Screen, Tile } from "../src/components/Screen";
import { colors, text } from "../src/theme";
import { useAppStore } from "../src/store";

export default function Login() {
  const [nickname, setNickname] = useState("");
  const players = useAppStore((state) => state.players);
  const createPlayer = useAppStore((state) => state.createPlayer);
  const setPlayer = useAppStore((state) => state.setPlayer);
  const enter = () => { if (!createPlayer(nickname)) Alert.alert("Choose a different nickname", "Nickname cannot be empty or already in use."); else router.replace("/home"); };
  return <Screen><Text style={text.title}>Who is solving today?</Text><Text style={[text.body, { color: colors.muted }]}>Your progress stays on this device and works offline.</Text><Tile color={colors.white}><Text style={styles.label}>New player</Text><TextInput value={nickname} onChangeText={setNickname} placeholder="Enter a nickname" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="words" /><Button onPress={enter}>Create player</Button></Tile>{players.length > 0 && <><Text style={text.subheading}>Choose a player</Text>{players.map((player) => <Button key={player.id} variant="quiet" onPress={() => { setPlayer(player); router.replace("/home"); }}>{player.nickname}</Button>)}</>}</Screen>;
}
const styles = StyleSheet.create({ label: { ...text.subheading, marginBottom: 12 }, input: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 15, fontSize: 16, color: colors.ink, marginBottom: 14 } });
