import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { colors } from "../src/theme";
import { useAppStore } from "../src/store";
const splashReveal = FadeInDown.duration(290).reduceMotion(ReduceMotion.System);

export default function Splash() {
  const player = useAppStore((state) => state.player);
  const ready = useAppStore((state) => state.ready);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => router.replace(player ? "/home" : "/login"), 700);
    return () => clearTimeout(timer);
  }, [player, ready]);
  return <View style={styles.screen}><Animated.View entering={splashReveal} style={styles.mark}><Text style={styles.logo}>S</Text></Animated.View><Text style={styles.title}>SALI PUZZLE</Text><Text style={styles.tagline}>Learn. Hunt. Solve.</Text><ActivityIndicator color={colors.mint} style={styles.loader} /></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.indigo, alignItems: "center", justifyContent: "center" }, mark: { width: 92, height: 92, borderRadius: 28, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center", transform: [{ rotate: "8deg" }] }, logo: { color: colors.ink, fontSize: 58, fontWeight: "900" }, title: { color: colors.white, fontSize: 32, fontWeight: "900", marginTop: 24, letterSpacing: 1 }, tagline: { color: colors.paper, fontSize: 17, marginTop: 6 }, loader: { marginTop: 42 } });
