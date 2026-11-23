import { Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useFonts } from "expo-font";
import { initializeDatabase } from "../src/database";
import { hydratePlayers, useAppStore } from "../src/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PuzzleAudioProvider } from "../src/components/PuzzleAudio";
import { fontAssets } from "../src/theme";

export default function Layout() {
  const [screen] = useSegments();
  const paused = useAppStore((state) => state.round?.paused);
  const roundId = useAppStore((state) => state.round?.id);
  const gameplay = screen === "word-hunt" || screen === "crossword";
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  useEffect(() => { initializeDatabase(); hydratePlayers(); }, []);
  useEffect(() => {
    const store = useAppStore.getState();
    const sync = (activity: string | null) => store.setClockRunning(gameplay && !paused && activity === "active");
    sync(AppState.currentState ?? "active");
    const subscription = AppState.addEventListener("change", sync);
    const timer = gameplay && !paused ? setInterval(store.checkpoint, 10000) : undefined;
    return () => {
      subscription.remove();
      clearInterval(timer);
      store.setClockRunning(false);
    };
  }, [gameplay, roundId, paused]);
  if (!fontsLoaded && !fontError) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PuzzleAudioProvider>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </PuzzleAudioProvider>
    </GestureHandlerRootView>
  );
}
