import { PropsWithChildren, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureDetector, type NativeGesture } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Level } from "../types";
import { useAppStore } from "../store";
import { fonts } from "../theme";

export const puzzle = {
  paper: "#FFF8E5",
  sunshine: "#FFC240",
  ink: "#261739",
  grape: "#582EA0",
  lilac: "#EADFFF",
  white: "#FFFFFF",
  success: "#155F47",
  mint: "#D8F4E5",
  error: "#9F273F",
  blush: "#FFE3E9",
} as const;

type PuzzleScreenProps = PropsWithChildren<{
  level: Level;
  stage: "Word hunt" | "Crossword" | "Results";
  scrollGesture?: NativeGesture;
}>;

export function PuzzleScreen({ level, stage, scrollGesture, children }: PuzzleScreenProps) {
  const audioOn = useAppStore((state) => state.preferences.soundEffects);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const content = (
    <ScrollView
      style={styles.viewport}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scroll}
      scrollEnabled={!scrollGesture || contentHeight > viewportHeight + 1}
      onLayout={scrollGesture ? (event) => setViewportHeight(event.nativeEvent.layout.height) : undefined}
      onContentSizeChange={scrollGesture ? (_, height) => setContentHeight(height) : undefined}
    >
      <View style={styles.content}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.canGoBack() ? router.back() : router.replace("/levels")} style={({ pressed }) => [styles.icon, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={puzzle.ink} />
          </Pressable>
          <Text style={styles.stage}>Level {level.number} / {stage}</Text>
          <Pressable accessibilityRole="switch" accessibilityLabel="Sound effects" accessibilityState={{ checked: audioOn }} onPress={() => useAppStore.getState().setPreference("soundEffects", !audioOn)} style={({ pressed }) => [styles.icon, audioOn && styles.audioOn, pressed && styles.pressed]}>
            <Ionicons name={audioOn ? "volume-high" : "volume-mute"} size={22} color={audioOn ? puzzle.white : puzzle.ink} />
          </Pressable>
        </View>
        {children}
      </View>
    </ScrollView>
  );
  return (
    <SafeAreaView style={styles.safe}>
      {scrollGesture ? <GestureDetector gesture={scrollGesture}>{content}</GestureDetector> : content}
    </SafeAreaView>
  );
}

export function PuzzleProgress({ count, total, label, points }: { count: number; total: number; label: string; points?: number }) {
  return (
    <View style={styles.progress}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{count} of {total} {label}</Text>
        {points !== undefined && <Text style={styles.progressText}>{points} pts</Text>}
      </View>
      <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: total, now: count }} style={styles.track}>
        {Array.from({ length: total }, (_, index) => <View key={index} style={[styles.segment, index < count && styles.filled]} />)}
      </View>
    </View>
  );
}

export const puzzleText = StyleSheet.create({
  title: { color: puzzle.ink, fontSize: 34, lineHeight: 43, fontFamily: fonts.heading, letterSpacing: -1.4 },
  heading: { color: puzzle.ink, fontSize: 19, fontFamily: fonts.heading },
  body: { color: puzzle.ink, fontSize: 16, lineHeight: 22, fontFamily: fonts.body },
  label: { color: puzzle.ink, fontSize: 14, fontFamily: fonts.button },
});

export function PuzzleButton({ children, onPress, quiet = false }: PropsWithChildren<{ onPress: () => void; quiet?: boolean }>) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, quiet && styles.quiet, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, quiet && styles.quietText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: puzzle.paper },
  viewport: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { width: "100%", maxWidth: 490, alignSelf: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: puzzle.white, borderWidth: 1, borderColor: puzzle.lilac },
  audioOn: { backgroundColor: puzzle.grape },
  stage: { flexShrink: 1, textAlign: "center", color: puzzle.grape, fontSize: 14, fontFamily: fonts.button },
  progress: { gap: 7 },
  progressRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 4 },
  progressText: { color: puzzle.ink, fontFamily: fonts.button, fontSize: 14 },
  track: { flexDirection: "row", gap: 4 },
  segment: { flex: 1, height: 7, borderRadius: 8, backgroundColor: puzzle.lilac },
  filled: { backgroundColor: puzzle.grape },
  button: { borderRadius: 15, backgroundColor: puzzle.grape, minHeight: 48, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  quiet: { backgroundColor: puzzle.lilac },
  buttonText: { color: puzzle.white, fontSize: 15, fontFamily: fonts.button, textAlign: "center" },
  quietText: { color: puzzle.grape },
  pressed: { opacity: 0.72 },
});
