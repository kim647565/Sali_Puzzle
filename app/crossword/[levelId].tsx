import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { PuzzleButton, PuzzleProgress, PuzzleScreen, puzzle, puzzleText } from "../../src/components/PuzzleScreen";
import { usePuzzleFeedback } from "../../src/components/PuzzleAudio";
import { PausedRound, RoundControls } from "../../src/components/RoundControls";
import { getLevel } from "../../src/data/levels";
import { clueCells, clueId, crosswordGrid, writeClue, Clue } from "../../src/engines/crossword";
import { pointsPerAnswer, Round } from "../../src/engines/round";
import { useAppStore } from "../../src/store";
import { Level } from "../../src/types";
import { fonts } from "../../src/theme";

export default function Crossword() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const round = useAppStore((state) => state.round);
  if (!level || round?.levelId !== level.id || !level.huntWords.every((word) => round.found[word])) {
    return <Screen><Text>Find all the hidden words to open the crossword.</Text><PuzzleButton onPress={() => router.replace("/levels")}>Go to levels</PuzzleButton></Screen>;
  }
  if (round.paused) return <PuzzleScreen level={level} stage="Crossword"><PausedRound /></PuzzleScreen>;
  return <CrosswordBoard key={round.id} level={level} round={round} />;
}

function CrosswordBoard({ level, round }: { level: Level; round: Round }) {
  const board = useMemo(() => crosswordGrid(level.clues), [level.clues]);
  const [current, setCurrent] = useState<Clue | undefined>(level.clues.find((clue) => !round.solved.includes(clueId(clue))));
  const [selected, setSelected] = useState<string>();
  const [editingCell, setEditingCell] = useState<string>();
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [boardWidth, setBoardWidth] = useState(0);
  const playFeedback = usePuzzleFeedback();
  const locked = new Set(level.clues.filter((clue) => round.solved.includes(clueId(clue))).flatMap((clue) => clueCells(clue).map((cell) => cell.key)));
  const currentCells = current ? clueCells(current) : [];
  const path = new Set(currentCells.map((cell) => cell.key));
  const cellSize = boardWidth / board.columns;
  const done = round.solved.length === level.clues.length;
  const value = currentCells.map((cell) => round.letters[cell.key] ?? " ").join("").trimEnd();
  const activeCell = currentCells.find((cell) => cell.key === editingCell && !locked.has(cell.key));

  function edit(answer: string) {
    if (!current) return;
    const letters = useAppStore.getState().round?.letters ?? round.letters;
    useAppStore.getState().writeLetters(writeClue(current, answer.toUpperCase().replace(/[^A-Z ]/g, ""), letters, locked));
    setError("");
  }

  function choose(clue: Clue, key?: string) {
    if (round.solved.includes(clueId(clue))) return;
    setCurrent(clue);
    setSelected(key);
    setEditingCell(key);
    setError("");
  }

  function check() {
    if (!current) return;
    const store = useAppStore.getState();
    const letters = store.round?.letters ?? {};
    const answer = currentCells.map((cell) => letters[cell.key] ?? " ").join("");
    const result = answer.includes(" ") ? "incomplete" : store.submitClue(clueId(current), answer);
    if (result === "incomplete") {
      setError(`Fill all ${current.answer.length} letters first.`);
      return;
    }
    if (result === "wrong") {
      playFeedback(false);
      setError("Try again. Which word matches this clue?");
      return;
    }
    playFeedback(true);
    Keyboard.dismiss();
    setError("");
    setAnnouncement(`Clue ${current.number} solved! +${pointsPerAnswer} points`);
    setCurrent(level.clues.find((clue) => !useAppStore.getState().round?.solved.includes(clueId(clue))));
    setSelected(undefined);
    setEditingCell(undefined);
  }

  function reveal() {
    const cell = currentCells.find((item) => !locked.has(item.key) && round.letters[item.key] !== item.letter);
    if (!cell) {
      setAnnouncement("All the letters for this clue are filled. Tap Check.");
      return;
    }
    const store = useAppStore.getState();
    store.writeLetters({ ...round.letters, [cell.key]: cell.letter }, true);
    setSelected(cell.key);
    setError("");
    setAnnouncement("One letter revealed.");
  }

  function finish() {
    try {
      if (useAppStore.getState().finishRound(level.id)) router.replace(`/results/${level.id}`);
    } catch {
      setError("Your answers are still here. Tap View results to try saving again.");
    }
  }

  return (
    <PuzzleScreen level={level} stage="Crossword">
      <View>
        <Text accessibilityRole="header" style={puzzleText.title}>Crossword</Text>
        <Text style={puzzleText.body}>{level.title}</Text>
      </View>
      <PuzzleProgress count={round.solved.length} total={level.clues.length} label="clues solved" points={(Object.keys(round.found).length + round.solved.length) * pointsPerAnswer} />
      <RoundControls round={round} />
      <View style={styles.board}>
        <View onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)} style={[styles.grid, { maxWidth: board.columns * 46 }]}>
          {Array.from({ length: board.rows }, (_, row) => (
            <View key={row} style={styles.row}>
              {Array.from({ length: board.columns }, (_, column) => {
                const key = `${row}:${column}`;
                const cell = board.cells.get(key);
                if (!cell) return <View key={key} style={styles.empty} />;
                const solved = locked.has(key);
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`Row ${row + 1}, column ${column + 1}, ${round.letters[key] ?? "blank"}${solved ? ", solved" : ""}`}
                    accessibilityState={{ selected: path.has(key), disabled: done }}
                    disabled={done}
                    onPress={() => {
                      const entries = cell.clues.filter((clue) => !round.solved.includes(clueId(clue)));
                      const next = current && selected === key ? entries.find((clue) => clue !== current) : entries.find((clue) => clue === current);
                      if (next || entries[0]) choose(next ?? entries[0], key);
                    }}
                    style={({ pressed }) => [styles.cell, path.has(key) && styles.active, solved && styles.solved, selected === key && styles.selected, pressed && styles.pressed]}
                  >
                    {cell.number !== undefined && <Text allowFontScaling={false} style={styles.number}>{cell.number}</Text>}
                    <Text allowFontScaling={false} style={[styles.letter, { fontSize: Math.min(24, Math.max(12, cellSize * 0.46)) }]}>{round.letters[key] ?? ""}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {current && (
        <View style={styles.editor}>
          <Text style={puzzleText.heading}>{current.number} {current.direction}</Text>
          <Text style={puzzleText.body}>{current.clue}</Text>
          <TextInput
            key={activeCell?.key ?? `${current.number}:${current.direction}`}
            accessibilityLabel={activeCell ? `Letter in row ${activeCell.row + 1}, column ${activeCell.column + 1}` : `Answer for ${current.number} ${current.direction}, ${current.answer.length} letters`}
            placeholder={activeCell ? "Type one letter" : `Type ${current.answer.length} letters`}
            placeholderTextColor={puzzle.grape}
            autoCapitalize="characters"
            autoCorrect={false}
            spellCheck={false}
            maxLength={activeCell ? 1 : current.answer.length}
            selectTextOnFocus={Boolean(activeCell)}
            value={activeCell ? round.letters[activeCell.key] ?? "" : value}
            onChangeText={(text) => {
              if (!activeCell) {
                edit(text);
                return;
              }
              const store = useAppStore.getState();
              const letters = { ...store.round?.letters };
              const letter = text.toUpperCase().replace(/[^A-Z]/g, "")[0];
              if (letter) letters[activeCell.key] = letter;
              else delete letters[activeCell.key];
              store.writeLetters(letters);
              setError("");
            }}
            onSubmitEditing={check}
            returnKeyType="done"
            style={[styles.input, !!error && styles.inputError]}
          />
          <View style={styles.actions}>
            <PuzzleButton onPress={check}>Check answer</PuzzleButton>
            <PuzzleButton quiet onPress={reveal}>Hint</PuzzleButton>
            {activeCell && <PuzzleButton quiet onPress={() => setEditingCell(undefined)}>Edit whole answer</PuzzleButton>}
          </View>
        </View>
      )}
      {(error || announcement) !== "" && <Text accessibilityLiveRegion="polite" style={[styles.message, error ? styles.error : styles.success]}>{error || announcement}</Text>}
      {done ? <PuzzleButton onPress={finish}>View results</PuzzleButton> : <View style={styles.bank}>
        <Text style={puzzleText.heading}>Word bank</Text>
        <View style={styles.actions}>
          {level.huntWords.map((word) => (
            <Pressable key={word} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={() => {
              if (!current) return;
              if (word.length !== current.answer.length) {
                setError(`This clue needs ${current.answer.length} letters. ${word} has ${word.length}.`);
                return;
              }
              Keyboard.dismiss();
              setEditingCell(undefined);
              edit(word);
            }}><Text style={puzzleText.label}>{word}</Text></Pressable>
          ))}
        </View>
      </View>}
      {(["across", "down"] as const).map((direction) => (
        <View key={direction} style={styles.clues}>
          <Text accessibilityRole="header" style={puzzleText.heading}>{direction === "across" ? "Across" : "Down"}</Text>
          {level.clues.filter((clue) => clue.direction === direction).map((clue) => {
            const solved = round.solved.includes(clueId(clue));
            return <Pressable key={clue.number} accessibilityRole="button" accessibilityState={{ selected: current === clue, disabled: solved }} disabled={solved} onPress={() => choose(clue)} style={[styles.clue, current === clue && styles.active, solved && styles.solved]}>
              <Ionicons name={solved ? "checkmark-circle" : "ellipse-outline"} color={solved ? puzzle.success : puzzle.grape} size={18} />
              <Text style={[puzzleText.body, styles.prompt]}>{clue.number}. {clue.clue}</Text>
            </Pressable>;
          })}
        </View>
      ))}
    </PuzzleScreen>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: puzzle.ink, borderRadius: 20, padding: 8 },
  grid: { width: "100%", alignSelf: "center" },
  row: { flexDirection: "row" },
  empty: { flex: 1, aspectRatio: 1 },
  cell: { flex: 1, aspectRatio: 1, backgroundColor: puzzle.white, alignItems: "center", justifyContent: "center", borderColor: puzzle.ink, borderWidth: 1 },
  active: { backgroundColor: puzzle.lilac },
  solved: { backgroundColor: puzzle.mint },
  selected: { borderWidth: 2, borderColor: puzzle.grape },
  pressed: { opacity: 0.65 },
  number: { position: "absolute", top: 1, start: 3, fontSize: 9, color: puzzle.grape, fontWeight: "800" },
  letter: { color: puzzle.ink, fontFamily: fonts.heading },
  editor: { padding: 13, backgroundColor: puzzle.white, borderRadius: 16, borderColor: puzzle.grape, borderWidth: 1, gap: 8 },
  input: { borderWidth: 1, borderColor: puzzle.lilac, borderRadius: 9, minHeight: 46, paddingHorizontal: 10, color: puzzle.ink, fontSize: 18, fontWeight: "800", backgroundColor: puzzle.paper },
  inputError: { borderColor: puzzle.error, backgroundColor: puzzle.blush },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  message: { padding: 10, borderRadius: 10, fontWeight: "700" },
  error: { color: puzzle.error, backgroundColor: puzzle.blush },
  success: { color: puzzle.success, backgroundColor: puzzle.mint },
  bank: { backgroundColor: puzzle.sunshine, borderRadius: 15, padding: 12, gap: 8 },
  chip: { backgroundColor: puzzle.paper, borderRadius: 9, minHeight: 44, paddingHorizontal: 10, justifyContent: "center" },
  clues: { gap: 6 },
  clue: { flexDirection: "row", alignItems: "center", padding: 9, minHeight: 44, borderRadius: 9, backgroundColor: puzzle.white, gap: 6 },
  prompt: { flex: 1 },
});
