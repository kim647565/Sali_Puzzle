import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, useNativeGesture, usePanGesture } from "react-native-gesture-handler";
import { PuzzleButton, PuzzleProgress, PuzzleScreen, puzzle, puzzleText } from "../../src/components/PuzzleScreen";
import { usePuzzleFeedback } from "../../src/components/PuzzleAudio";
import { PausedRound, RoundControls } from "../../src/components/RoundControls";
import { Button } from "../../src/components/Button";
import { Screen } from "../../src/components/Screen";
import { getLevel } from "../../src/data/levels";
import { pointsPerAnswer, Round } from "../../src/engines/round";
import { Cell, findWordStart, sameCell, selectionToWord } from "../../src/engines/wordHunt";
import { useAppStore } from "../../src/store";
import { Level } from "../../src/types";
import { fonts } from "../../src/theme";

type Path = { start: Cell; end: Cell };
type Feedback = { message: string; tone: "info" | "correct" | "wrong" };

export default function WordHunt() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const round = useAppStore((state) => state.round);
  if (!level || round?.levelId !== level.id) {
    return <Screen><Text>Open a lesson to start its word hunt.</Text><Button onPress={() => router.replace("/levels")}>Go to levels</Button></Screen>;
  }
  if (round.paused) return <PuzzleScreen level={level} stage="Word hunt"><PausedRound /></PuzzleScreen>;
  return <HuntBoard key={round.id} level={level} round={round} />;
}

function HuntBoard({ level, round }: { level: Level; round: Round }) {
  const diagonals = level.difficulty !== "Easy";
  const instructions = `Swipe ${diagonals ? "in a straight line" : "across or down"}, or tap the first and last letters.`;
  const [boardWidth, setBoardWidth] = useState(0);
  const [start, setStart] = useState<Cell | null>(null);
  const [drag, setDrag] = useState<Path | null>(null);
  const [wrongPath, setWrongPath] = useState<Path | null>(null);
  const [hint, setHint] = useState<Cell | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({ message: instructions, tone: "info" });
  const tapStart = useRef<Cell | null>(null);
  const origin = useRef<Cell | null>(null);
  const dragEnd = useRef<Cell | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playFeedback = usePuzzleFeedback();
  const found = Object.keys(round.found).length;
  const done = found === level.huntWords.length;
  const size = level.grid.length;
  const cellSize = boardWidth / size;
  const active = drag ?? (start && { start, end: start });
  const activeSelection = active && selectionToWord(level.grid, active.start, active.end);
  const activeWord = active && (activeSelection?.word ?? level.grid[active.start.row][active.start.column]);
  const activePath = active && (activeSelection?.cells ?? [active.start, active.end]);
  const rejectedCells = wrongPath && selectionToWord(level.grid, wrongPath.start, wrongPath.end)?.cells;
  const foundPaths = Object.entries(round.found);

  useEffect(() => () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
  }, []);

  const clearWrong = () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    setWrongPath(null);
  };

  function selectStart(cell: Cell | null) {
    tapStart.current = cell;
    setStart(cell);
  }

  const check = (first: Cell, last: Cell) => {
    clearWrong();
    selectStart(null);
    const outcome = useAppStore.getState().submitWord(first, last);
    if (outcome === "correct") {
      const word = selectionToWord(level.grid, first, last)!.word;
      const target = level.huntWords.includes(word) ? word : [...word].reverse().join("");
      setHint(null);
      setFeedback({ message: `You found ${target}! +${pointsPerAnswer} points`, tone: "correct" });
      playFeedback(true);
    } else if (outcome === "duplicate") {
      setFeedback({ message: "You already found that word. Try another from the list.", tone: "info" });
    } else if (outcome === "wrong") {
      playFeedback(false);
      setWrongPath({ start: first, end: last });
      wrongTimer.current = setTimeout(() => setWrongPath(null), 650);
      setFeedback({ message: "Try again. Look for a word from the list.", tone: "wrong" });
    } else {
      setFeedback({ message: diagonals ? "Choose a straight line across, down, or diagonally." : "Choose a straight line across or down.", tone: "wrong" });
    }
  };

  function tap(cell: Cell) {
    const first = tapStart.current;
    if (first && !sameCell(first, cell)) {
      check(first, cell);
      return;
    }
    clearWrong();
    selectStart(first ? null : cell);
    setFeedback({ message: instructions, tone: "info" });
  }

  function cellAt(x: number, y: number) {
    if (!cellSize || x < 0 || y < 0 || x >= boardWidth || y >= boardWidth) return null;
    return { row: Math.floor(y / cellSize), column: Math.floor(x / cellSize) };
  }

  const scrollGesture = useNativeGesture({ delaysChildPressedState: false });
  const gesture = usePanGesture({
    block: scrollGesture,
    enabled: !done,
    runOnJS: true,
    minDistance: 7,
    maxPointers: 1,
    onBegin: ({ x, y }) => { origin.current = cellAt(x, y); },
    onActivate: () => {
      dragEnd.current = null;
      clearWrong();
      selectStart(null);
      setFeedback({ message: instructions, tone: "info" });
      if (origin.current) setDrag({ start: origin.current, end: origin.current });
    },
    onUpdate: ({ x, y }) => {
      const first = origin.current;
      const end = cellAt(x, y);
      if (!first || !end || sameCell(dragEnd.current, end)) return;
      dragEnd.current = end;
      setDrag({ start: first, end });
    },
    onDeactivate: ({ canceled, x, y }) => {
      const first = origin.current;
      const last = cellAt(x, y) ?? dragEnd.current;
      setDrag(null);
      if (!canceled && first && last && !sameCell(first, last)) check(first, last);
    },
  });

  function revealHint() {
    const word = level.huntWords.find((target) => !round.found[target]);
    const cell = word && findWordStart(level.grid, word, diagonals);
    if (!word || !cell) return;
    if (!sameCell(hint, cell)) useAppStore.getState().useHint();
    selectStart(null);
    clearWrong();
    setHint(cell);
    setFeedback({ message: `Find ${word} starting at the outlined letter.`, tone: "info" });
  }

  return (
    <PuzzleScreen level={level} stage="Word hunt" scrollGesture={scrollGesture}>
      <View>
        <Text accessibilityRole="header" style={puzzleText.title}>Word hunt</Text>
        <Text style={puzzleText.body}>{level.title}</Text>
      </View>
      <PuzzleProgress count={found} total={level.huntWords.length} label="words found" points={found * pointsPerAnswer} />
      <RoundControls round={round} />
      <View style={styles.board}>
        <GestureDetector gesture={gesture} touchAction="none">
          <View collapsable={false} style={styles.grid} onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {foundPaths.map(([word, cells]) => <Trace key={word} start={cells[0]} end={cells[cells.length - 1]} size={cellSize} color={puzzle.grape} />)}
              {wrongPath && <Trace {...wrongPath} size={cellSize} color={puzzle.error} />}
              {active && activeSelection && <Trace {...active} size={cellSize} color={puzzle.lilac} />}
            </View>
            {level.grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((letter, columnIndex) => {
                  const cell = { row: rowIndex, column: columnIndex };
                  const selected = activePath?.some((item) => sameCell(item, cell)) ?? false;
                  const completed = foundPaths.some(([, path]) => path.some((item) => sameCell(item, cell)));
                  const rejected = rejectedCells?.some((item) => sameCell(item, cell));
                  const hinted = sameCell(hint, cell);
                  return (
                    <Pressable
                      key={columnIndex}
                      disabled={done}
                      accessibilityRole="button"
                      accessibilityLabel={`${letter}, row ${rowIndex + 1}, column ${columnIndex + 1}${completed ? ", found" : ""}${hinted ? ", hint" : ""}`}
                      accessibilityState={{ selected, disabled: done }}
                      onPress={() => tap(cell)}
                      style={({ pressed }) => [styles.cell, (pressed || selected) && styles.pressedCell, hinted && styles.hinted]}
                    >
                      <Text allowFontScaling={false} style={[styles.letter, { fontSize: Math.max(16, Math.min(32, cellSize * 0.62)) }, (completed || rejected) && !selected && styles.lightLetter]}>{letter}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </GestureDetector>
      </View>
      <View style={[styles.feedback, !active && feedback.tone === "correct" && styles.correct, !active && feedback.tone === "wrong" && styles.wrong]}>
        <Text accessibilityLiveRegion={drag ? "none" : "polite"} style={puzzleText.body}>
          {activeWord ? `Selected: ${activeWord}${start ? ". Tap the last letter." : ""}` : feedback.message}
        </Text>
      </View>
      <View style={styles.bank}>
        <View style={styles.bankHeader}>
          <Text style={puzzleText.heading}>Words to find</Text>
          {!done && (
            <Pressable accessibilityRole="button" onPress={revealHint} style={({ pressed }) => [styles.hintButton, pressed && { opacity: 0.65 }]}>
              <Ionicons name="bulb-outline" size={17} color={puzzle.grape} /><Text style={puzzleText.label}>Hint</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.chips}>
          {level.huntWords.map((word) => (
            <View key={word} style={[styles.chip, round.found[word] && styles.correct]} accessible accessibilityLabel={`${word}, ${round.found[word] ? "found" : "to find"}`}>
              {round.found[word] && <Ionicons name="checkmark-circle" size={17} color={puzzle.success} />}
              <Text style={puzzleText.label}>{word}</Text>
            </View>
          ))}
        </View>
      </View>
      {done && <PuzzleButton onPress={() => router.push(`/crossword/${level.id}`)}>Solve crossword</PuzzleButton>}
    </PuzzleScreen>
  );
}

function Trace({ start, end, size, color }: Path & { size: number; color: string }) {
  const dx = (end.column - start.column) * size;
  const dy = (end.row - start.row) * size;
  const height = size * 0.81;
  const width = Math.hypot(dx, dy) + height;
  return (
    <View style={{
      position: "absolute",
      left: (start.column + 0.5) * size + dx / 2 - width / 2,
      top: (start.row + 0.5) * size + dy / 2 - height / 2,
      width, height, borderRadius: height / 2, backgroundColor: color,
      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
    }} />
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: puzzle.sunshine, borderRadius: 26, padding: 12, borderBottomWidth: 5, borderBottomColor: "#DF961E" },
  grid: { width: "100%", aspectRatio: 1 },
  row: { flex: 1, flexDirection: "row" },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 30, borderWidth: 2, borderColor: "transparent" },
  pressedCell: { backgroundColor: puzzle.lilac, borderColor: puzzle.grape },
  hinted: { borderColor: puzzle.grape, borderStyle: "dashed" },
  letter: { fontFamily: fonts.heading, color: puzzle.ink, includeFontPadding: false },
  lightLetter: { color: puzzle.white },
  feedback: { backgroundColor: puzzle.lilac, paddingHorizontal: 14, paddingVertical: 10, minHeight: 45, borderRadius: 13, justifyContent: "center" },
  correct: { backgroundColor: puzzle.mint },
  wrong: { backgroundColor: puzzle.blush },
  bank: { gap: 8 },
  bankHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hintButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: puzzle.lilac, flexDirection: "row", alignItems: "center", gap: 5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: puzzle.white, borderRadius: 20, borderWidth: 1, borderColor: puzzle.lilac, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", flexDirection: "row", gap: 5 },
});
