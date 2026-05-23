import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
};

export default function ProfileTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nasıl kullanacaksın?</Text>
        <Text style={styles.subtitle}>
          Profilini oluşturalım. Bu seçim ileride değiştirilebilir.
        </Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(onboarding)/musician')}
          activeOpacity={0.8}
        >
          <Text style={styles.cardEmoji}>🎸</Text>
          <Text style={styles.cardTitle}>Müzisyenim</Text>
          <Text style={styles.cardDesc}>
            Band arıyorum, müzisyen arkadaşlar bulmak istiyorum
          </Text>
          <View style={styles.cardArrow}>
            <Text style={styles.cardArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(onboarding)/band')}
          activeOpacity={0.8}
        >
          <Text style={styles.cardEmoji}>🎤</Text>
          <Text style={styles.cardTitle}>Band'ım</Text>
          <Text style={styles.cardDesc}>
            Grubumuza müzisyen arıyoruz
          </Text>
          <View style={styles.cardArrow}>
            <Text style={styles.cardArrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: C.sub,
    fontSize: 15,
    lineHeight: 22,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: C.sub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    backgroundColor: C.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
