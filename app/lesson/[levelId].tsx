import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PuzzleButton, PuzzleProgress, puzzle, puzzleText } from "../../src/components/PuzzleScreen";
import { Screen } from "../../src/components/Screen";
import { getLevel, isLevelUnlocked } from "../../src/data/levels";
import { useAppStore } from "../../src/store";
import { Level } from "../../src/types";

export default function Lesson() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const ready = useAppStore((state) => state.ready);
  const player = useAppStore((state) => state.player);
  const progress = useAppStore((state) => state.progress);
  if (!ready) return <Screen><Text>Loading lesson…</Text></Screen>;
  if (!level) return <Screen><Text>Lesson not found.</Text><PuzzleButton onPress={() => router.replace("/levels")}>Go to levels</PuzzleButton></Screen>;
  if (!player) return <Screen><Text>Choose a player to start the lesson.</Text><PuzzleButton onPress={() => router.replace("/login")}>Choose a player</PuzzleButton></Screen>;
  if (!isLevelUnlocked(level, progress)) return <Screen><Text>Finish the previous level to unlock this lesson.</Text><PuzzleButton onPress={() => router.replace("/levels")}>Go to levels</PuzzleButton></Screen>;
  return <LessonPages key={level.id} level={level} />;
}

function LessonPages({ level }: { level: Level }) {
  const [section, setSection] = useState(0);
  const round = useAppStore((state) => state.round);
  const ongoing = round?.levelId === level.id && !round.result;
  function start() {
    const store = useAppStore.getState();
    if (!store.startRound(level.id)) return;
    const huntReady = level.huntWords.every((word) => useAppStore.getState().round?.found[word]);
    router.push(huntReady ? `/crossword/${level.id}` : `/word-hunt/${level.id}`);
  }

  return <Screen background={puzzle.paper}>
    <Text style={puzzleText.label}>Level {level.number} / {level.difficulty}</Text>
    <Text accessibilityRole="header" style={puzzleText.title}>{level.title}</Text>
    <PuzzleProgress count={section + 1} total={3} label="lesson sections" />
    {section === 0 && <View style={styles.card}>
      <Text style={puzzleText.heading}>{level.topic}</Text>
      <Text style={puzzleText.body}>{level.lesson}</Text>
      <Text style={puzzleText.heading}>What you’ll learn</Text>
      {level.objectives.map((objective) => <Text key={objective} style={puzzleText.body}>• {objective}</Text>)}
    </View>}
    {section === 1 && <View style={styles.card}>
      <Text style={puzzleText.heading}>Key words</Text>
      {level.vocabulary.map(({ word, definition }) => <View key={word}>
        <Text style={puzzleText.label}>{word}</Text><Text style={puzzleText.body}>{definition}</Text>
      </View>)}
    </View>}
    {section === 2 && <View style={styles.card}>
      <Text style={puzzleText.heading}>Example</Text><Text style={puzzleText.body}>{level.example}</Text>
      <Text style={puzzleText.heading}>Summary</Text><Text style={puzzleText.body}>{level.summary}</Text>
    </View>}
    {section < 2 && <PuzzleButton onPress={() => setSection(section + 1)}>Next section</PuzzleButton>}
    {(section === 2 || ongoing) && <PuzzleButton onPress={start}>{ongoing ? "Continue puzzles" : "Start word hunt"}</PuzzleButton>}
    {section > 0 && <PuzzleButton quiet onPress={() => setSection(section - 1)}>Previous section</PuzzleButton>}
    <PuzzleButton quiet onPress={() => router.dismissTo("/levels")}>Back to levels</PuzzleButton>
  </Screen>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: puzzle.white, borderRadius: 17, padding: 16, gap: 9 },
});
