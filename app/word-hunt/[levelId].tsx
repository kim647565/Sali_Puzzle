import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../src/components/Button";
import { Screen, Tile } from "../../src/components/Screen";
import { getLevel } from "../../src/data/levels";
import { selectionToWord, Cell } from "../../src/engines/wordHunt";
import { colors, spacing, text } from "../../src/theme";

export default function WordHunt() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const [start, setStart] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  if (!level) return <Screen><Text>Puzzle not found.</Text></Screen>;
  const choose = (cell: Cell) => { if (!start) { setStart(cell); return; } const result = selectionToWord(level.grid, start, cell); setStart(null); if (!result) return; const word = result.word.toUpperCase(); if (level.huntWords.includes(word) && !found.includes(word)) { setFound([...found, word]); } else if (level.huntWords.includes(word)) Alert.alert("Already found", `${word} is already in your word bank.`); else Alert.alert("Try again", "Look for a straight line of lesson words."); };
  const done = found.length === level.huntWords.length;
  return <Screen><Text style={text.title}>Word hunt</Text><Text style={{ color: colors.muted }}>Tap the first and last letter of each hidden word.</Text><Tile color={colors.indigo}><Text style={{ color: colors.paper, fontWeight: "800" }}>{found.length} of {level.huntWords.length} found</Text><Text style={styles.wordBank}>{level.huntWords.map((word) => found.includes(word) ? `✓ ${word}` : `• ${word}`).join("   ")}</Text></Tile><View style={styles.grid}>{level.grid.map((row, rowIndex) => row.map((letter, columnIndex) => <Pressable key={`${rowIndex}-${columnIndex}`} onPress={() => choose({ row: rowIndex, column: columnIndex })} style={[styles.cell, start?.row === rowIndex && start.column === columnIndex && styles.selected]}><Text style={styles.letter}>{letter}</Text></Pressable>))}</View>{done ? <Tile color={colors.mint}><Text style={text.subheading}>All words found.</Text><Text style={text.body}>Your word bank is ready for the crossword.</Text><Button variant="secondary" onPress={() => router.push(`/crossword/${level.id}`)}>Solve crossword</Button></Tile> : <Text style={{ color: colors.muted, textAlign: "center" }}>Start with any letter in the grid.</Text>}</Screen>;
}
const styles = StyleSheet.create({ wordBank: { color: colors.white, fontSize: 15, marginTop: 10, lineHeight: 25 }, grid: { alignSelf: "center", width: "100%", maxWidth: 360, aspectRatio: 1, flexDirection: "row", flexWrap: "wrap", gap: 5 }, cell: { width: "15.5%", aspectRatio: 1, backgroundColor: colors.white, borderRadius: 10, alignItems: "center", justifyContent: "center" }, selected: { backgroundColor: colors.amber, transform: [{ scale: 1.06 }] }, letter: { color: colors.ink, fontSize: 20, fontWeight: "900" } });
