import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "../src/database";
import { hydratePlayers } from "../src/store";

export default function Layout() {
  useEffect(() => { initializeDatabase(); hydratePlayers(); }, []);
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
