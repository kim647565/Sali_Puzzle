import { createContext, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { useSegments } from "expo-router";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../store";

const FeedbackContext = createContext<(correct: boolean) => void>(() => {});

function configurePlayer(player: AudioPlayer, volume: number, loop = false) {
  player.volume = volume;
  player.loop = loop;
}

export function PuzzleAudioProvider({ children }: PropsWithChildren) {
  const music = useAudioPlayer(require("../../assets/audio/puzzle-loop.wav"));
  const success = useAudioPlayer(require("../../assets/audio/solved.wav"));
  const retry = useAudioPlayer(require("../../assets/audio/try-again.wav"));
  const [screen] = useSegments();
  const settings = useAppStore((state) => state.preferences);
  const paused = useAppStore((state) => state.round?.paused);
  const active = !paused && (screen === "word-hunt" || screen === "crossword" || screen === "results");
  const feedbackVersion = useRef(0);

  useEffect(() => {
    configurePlayer(music, 0.23, true);
    configurePlayer(success, 0.46);
    configurePlayer(retry, 0.44);
  }, [music, success, retry]);

  useEffect(() => {
    if (active && settings.backgroundMusic) music.play();
    else music.pause();
  }, [active, settings.backgroundMusic, music]);

  useEffect(() => {
    if (!active || !settings.soundEffects) {
      feedbackVersion.current += 1;
      success.pause();
      retry.pause();
    }
  }, [active, settings.soundEffects, success, retry]);

  function playFeedback(correct: boolean) {
    if (!active) return;
    const { haptics, soundEffects } = useAppStore.getState().preferences;
    if (haptics) {
      void Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    if (!soundEffects) return;
    const version = ++feedbackVersion.current;
    const effect = correct ? success : retry;
    const otherEffect = correct ? retry : success;
    otherEffect.pause();
    void effect.seekTo(0).then(() => {
      if (feedbackVersion.current === version && useAppStore.getState().preferences.soundEffects) effect.play();
    }).catch(() => {});
  }

  return <FeedbackContext.Provider value={playFeedback}>{children}</FeedbackContext.Provider>;
}

export const usePuzzleFeedback = () => useContext(FeedbackContext);
