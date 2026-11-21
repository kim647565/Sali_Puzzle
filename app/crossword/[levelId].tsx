import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../src/components/Button";
import { Screen, Tile } from "../../src/components/Screen";
import { getLevel } from "../../src/data/levels";
import { colors, text } from "../../src/theme";

export default function Crossword() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  if (!level) return <Screen><Text>Puzzle not found.</Text></Screen>;
  const check = () => { const correct = level.clues.every((clue) => answers[clue.number]?.trim().toUpperCase() === clue.answer); if (!correct) { Alert.alert("Keep solving", "Check each clue and try again."); return; } router.replace(`/results/${level.id}?score=${(level.huntWords.length + level.clues.length) * 100}`); };
  return <Screen><Text style={text.title}>Crossword</Text><Text style={{ color: colors.muted }}>Use the words you found to answer each clue.</Text>{level.clues.map((clue) => <Tile key={clue.number}><Text style={text.subheading}>{clue.number}. {clue.clue}</Text><TextInput autoCapitalize="characters" value={answers[clue.number] ?? ""} onChangeText={(value) => setAnswers({ ...answers, [clue.number]: value })} style={styles.input} placeholder="Type the answer" placeholderTextColor={colors.muted} /></Tile>)}<Button onPress={check}>Check answers</Button></Screen>;
}
const styles = StyleSheet.create({ input: { borderBottomWidth: 2, borderBottomColor: colors.indigo, paddingVertical: 10, color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 10 } });
