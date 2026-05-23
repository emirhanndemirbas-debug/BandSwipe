import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { generateEmbedding } from '../../lib/embedding';
import CollapsibleChipGroup from '../../components/CollapsibleChipGroup';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
  input: '#141414',
  chip: '#242424',
  chipActive: '#3D0020',
  chipTextActive: '#E91E8C',
};

const INSTRUMENTS = [
  'Gitar', 'Bas Gitar', 'Davul', 'Klavye/Piyano', 'Vokal',
  'Keman', 'Saksofon', 'Trompet', 'Saz/Bağlama', 'DJ/Prodüktör', 'Diğer',
];

const GENRES = [
  'Rock', 'Metal', 'Pop', 'Hip-Hop', 'Jazz', 'Blues',
  'Folk', 'Electronic', 'Indie', 'Alternative', 'Punk',
  'R&B', 'Arabesk', 'Klasik', 'Reggae', 'Funk',
];

const GOALS = [
  'Canlı Performans', 'Stüdyo Kaydı', 'Turneler',
  'Eğlence Amaçlı', 'Profesyonel Kariyer', 'Online İçerik',
];

const SKILL_LEVELS = [
  { label: 'Başlangıç', value: 'beginner' },
  { label: 'Orta', value: 'intermediate' },
  { label: 'İleri', value: 'advanced' },
  { label: 'Profesyonel', value: 'professional' },
];

export default function MusicianOnboarding() {
  const { session, setOnboardingCompleted } = useAuthStore();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [instrument, setInstrument] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleSingle(val: string, setter: (v: string[]) => void) {
    setter([val]);
  }

  function toggleMulti(val: string, current: string[], setter: (v: string[]) => void) {
    if (current.includes(val)) {
      setter(current.filter((x) => x !== val));
    } else {
      setter([...current, val]);
    }
  }

  async function handleSubmit() {
    setErrorMsg('');
    if (!name.trim()) { setErrorMsg('İsim zorunludur.'); return; }
    if (!city.trim()) { setErrorMsg('Şehir zorunludur.'); return; }
    if (!age.trim()) { setErrorMsg('Yaş zorunludur.'); return; }
    if (instrument.length === 0) { setErrorMsg('En az bir enstrüman seç.'); return; }
    if (genres.length === 0) { setErrorMsg('En az bir müzik türü seç.'); return; }
    if (skillLevel.length === 0) { setErrorMsg('Seviye seç.'); return; }

    setLoading(true);
    const userId = session!.user.id;

    try {
      const { error: profileError } = await supabase.from('musician_profiles').upsert({
        id: userId,
        name: name.trim(),
        city: city.trim(),
        age: age ? parseInt(age, 10) : null,
        instrument: instrument[0],
        skill_level: skillLevel[0],
        genres,
        goals,
        bio: bio.trim() || null,
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        return;
      }

      const { error: metaError } = await supabase.from('user_meta').upsert({
        id: userId,
        profile_type: 'musician',
        onboarding_completed: true,
      });

      if (metaError) {
        setErrorMsg(metaError.message);
        return;
      }

      void generateEmbedding(userId, 'musician');
      setOnboardingCompleted(true);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Bağlantı hatası. Supabase projen uyku modunda olabilir.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Müzisyen Profilin</Text>
      <Text style={styles.subtitle}>Seni daha iyi tanıyalım</Text>

      {/* Zorunlu alanlar */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>İSİM *</Text>
        <TextInput
          style={styles.input}
          placeholder="Adın veya sahne adın"
          placeholderTextColor={C.sub}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ŞEHİR *</Text>
        <TextInput
          style={styles.input}
          placeholder="İstanbul, Ankara, İzmir..."
          placeholderTextColor={C.sub}
          value={city}
          onChangeText={setCity}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Yaş *</Text>
        <TextInput
          style={[styles.input, styles.inputShort]}
          placeholder="25"
          placeholderTextColor={C.sub}
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <CollapsibleChipGroup
        label="Enstrüman *"
        options={INSTRUMENTS}
        selected={instrument}
        onToggle={(v) => toggleSingle(v, setInstrument)}
        single
      />

      <CollapsibleChipGroup
        label="Seviye *"
        options={SKILL_LEVELS.map((s) => s.label)}
        selected={SKILL_LEVELS.filter((s) => skillLevel.includes(s.value)).map((s) => s.label)}
        onToggle={(lbl) => {
          const found = SKILL_LEVELS.find((s) => s.label === lbl);
          if (found) toggleSingle(found.value, setSkillLevel);
        }}
        single
      />

      <CollapsibleChipGroup
        label="Müzik Türleri *"
        options={GENRES}
        selected={genres}
        onToggle={(v) => toggleMulti(v, genres, setGenres)}
      />

      <CollapsibleChipGroup
        label="Hedefler"
        options={GOALS}
        selected={goals}
        onToggle={(v) => toggleMulti(v, goals, setGoals)}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Kendini kısaca anlat..."
          placeholderTextColor={C.sub}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Profili Tamamla</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 16,
  },
  subtitle: {
    color: C.sub,
    fontSize: 14,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: C.sub,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  input: {
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    color: C.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  inputShort: {
    width: 100,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: C.chip,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.chipActive,
    borderColor: C.accent,
  },
  chipText: {
    color: C.sub,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: C.chipTextActive,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
