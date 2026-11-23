import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { PuzzleButton, PuzzleProgress, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { useAppStore } from "../src/store";

const steps = [
  { title: "Start with a lesson", icon: "book-outline", description: "Choose an unlocked level. Read the lesson and notice the key words. You’ll find those same words in both puzzles." },
  { title: "Trace a hidden word", icon: "search-outline", description: "Swipe in a straight line across or down. Medium and hard levels also use diagonals. Try tapping the first and last letters of SUN below." },
  { title: "Check your selection", icon: "checkmark-circle-outline", description: "Found words stay highlighted and earn 100 points each. If you’re stuck, tap Hint to see a starting letter." },
  { title: "Solve the crossword", icon: "grid-outline", description: "Pick an Across or Down clue. Type your answer or fill it from the word bank, then tap Check answer. Solved clues earn 100 points and share their letters with intersecting clues." },
  { title: "Open the next level", icon: "star-outline", description: "Finish both puzzles and tap View results. Your score, stars, and accuracy are saved in View records, and the next level unlocks." },
] as const;

export default function HowToPlay() {
  const [step, setStep] = useState(0);
  const [start, setStart] = useState(false);
  const [demo, setDemo] = useState<"idle" | "again" | "found">("idle");
  const last = step === steps.length - 1;
  const info = steps[step];

  function finish() {
    useAppStore.getState().setPreference("tutorialSeen", true);
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  }

  return <Screen background={puzzle.paper}>
    <Text accessibilityRole="header" style={puzzleText.title}>How to play</Text>
    <PuzzleProgress count={step + 1} total={steps.length} label="steps" />
    <View style={styles.lesson}>
      <Ionicons name={info.icon} color={puzzle.grape} size={32} />
      <Text style={puzzleText.heading}>{info.title}</Text>
      <Text style={puzzleText.body}>{info.description}</Text>
      {step === 1 && <View style={styles.demo}>
        <View style={styles.letters}>
          {["S", "U", "N", "K"].map((letter, index) => <Pressable key={letter} accessibilityRole="button" accessibilityState={{ selected: (start && index === 0) || (demo === "found" && index < 3) }} onPress={() => {
            if (index === 0) {
              setStart(true);
              setDemo("idle");
            } else {
              setDemo(index === 2 && start ? "found" : "again");
              setStart(false);
            }
          }} style={[styles.letter, start && index === 0 && styles.selected, demo === "found" && index < 3 && styles.found]}>
            <Text style={[puzzleText.heading, demo === "found" && index < 3 && styles.foundText]}>{letter}</Text>
          </Pressable>)}
        </View>
        <Text accessibilityLiveRegion="polite" style={puzzleText.label}>{demo === "found" ? "You found SUN!" : demo === "again" ? "Try tapping S, then N." : start ? "S selected. Tap N to finish." : "Tap S to begin."}</Text>
      </View>}
    </View>
    <PuzzleButton onPress={last ? finish : () => setStep(step + 1)}>{last ? "Finish" : "Next"}</PuzzleButton>
    {step > 0 && <PuzzleButton quiet onPress={() => setStep(step - 1)}>Previous</PuzzleButton>}
    {!last && <PuzzleButton quiet onPress={finish}>Skip tutorial</PuzzleButton>}
  </Screen>;
}

const styles = StyleSheet.create({
  lesson: { padding: 17, gap: 10, borderRadius: 21, backgroundColor: puzzle.sunshine },
  demo: { gap: 8, paddingTop: 6 },
  letters: { flexDirection: "row", gap: 6 },
  letter: { minHeight: 48, flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: puzzle.paper, borderRadius: 10 },
  selected: { backgroundColor: puzzle.lilac, borderColor: puzzle.grape, borderWidth: 2 },
  found: { backgroundColor: puzzle.grape },
  foundText: { color: puzzle.white },
});
