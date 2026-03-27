import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useApp } from "@/contexts/AppContext";
import { getTheme } from "@/constants/theme";
import { Target } from "lucide-react-native";

export default function NotFoundScreen() {
  const { theme } = useApp();
  const colors = getTheme(theme);

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Target color={colors.primary} size={64} />
        <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" asChild>
          <Pressable style={[styles.link, { backgroundColor: colors.primary }]}>
            <Text style={styles.linkText}>Go to Goals</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center" as const,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
