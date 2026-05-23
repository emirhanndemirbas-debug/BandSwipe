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

const GENRES = [
  'Rock', 'Metal', 'Pop', 'Hip-Hop', 'Jazz', 'Blues',
  'Folk', 'Electronic', 'Indie', 'Alternative', 'Punk',
  'R&B', 'Arabesk', 'Klasik', 'Reggae', 'Funk',
];

const ROLES = [
  'Gitarist', 'Basisit', 'Davulcu', 'Klavyeci', 'Vokalist',
  'Kemancı', 'Saksofoncu', 'DJ/Prodüktör', 'Diğer',
];

const GOALS = [
  'Canlı Performans', 'Stüdyo Kaydı', 'Turneler',
  'Eğlence Amaçlı', 'Profesyonel Kariyer', 'Online İçerik',
];

export default function BandOnboarding() {
  const { session, setOnboardingCompleted } = useAuthStore();

  const [bandName, setBandName] = useState('');
  const [city, setCity] = useState('');
  const [activeSince, setActiveSince] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function toggle(val: string, current: string[], setter: (v: string[]) => void) {
    if (current.includes(val)) {
      setter(current.filter((x) => x !== val));
    } else {
      setter([...current, val]);
    }
  }

  async function handleSubmit() {
    setErrorMsg('');
    if (!bandName.trim()) { setErrorMsg('Band adı zorunludur.'); return; }
    if (!city.trim()) { setErrorMsg('Şehir zorunludur.'); return; }
    if (genres.length === 0) { setErrorMsg('En az bir müzik türü seç.'); return; }
    if (requiredRoles.length === 0) { setErrorMsg('En az bir aranan rol seç.'); return; }
    if (minAge && maxAge && parseInt(maxAge, 10) < parseInt(minAge, 10)) {
      setErrorMsg('Maksimum yaş, minimumdan küçük olamaz.'); return;
    }

    setLoading(true);
    const userId = session!.user.id;

    try {
      const { error: profileError } = await supabase.from('band_profiles').upsert({
        id: userId,
        band_name: bandName.trim(),
        city: city.trim(),
        active_since: activeSince ? parseInt(activeSince, 10) : null,
        min_age: minAge ? parseInt(minAge, 10) : null,
        max_age: maxAge ? parseInt(maxAge, 10) : null,
        genres,
        required_roles: requiredRoles,
        goals,
        bio: bio.trim() || null,
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        return;
      }

      const { error: metaError } = await supabase.from('user_meta').upsert({
        id: userId,
        profile_type: 'band',
        onboarding_completed: true,
      });

      if (metaError) {
        setErrorMsg(metaError.message);
        return;
      }

      void generateEmbedding(userId, 'band');
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
      <Text style={styles.title}>Band Profiliniz</Text>
      <Text style={styles.subtitle}>Bandınızı tanıtalım</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Band Adı *</Text>
        <TextInput
          style={styles.input}
          placeholder="Band adınız"
          placeholderTextColor={C.sub}
          value={bandName}
          onChangeText={setBandName}
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
        <Text style={styles.sectionLabel}>Kuruluş Yılı</Text>
        <TextInput
          style={[styles.input, styles.inputShort]}
          placeholder="2020"
          placeholderTextColor={C.sub}
          value={activeSince}
          onChangeText={(t) => setActiveSince(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Aranan Yaş Aralığı</Text>
        <View style={styles.ageRow}>
          <TextInput
            style={[styles.input, styles.inputShort]}
            placeholder="Min"
            placeholderTextColor={C.sub}
            value={minAge}
            onChangeText={(t) => setMinAge(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.ageSep}>–</Text>
          <TextInput
            style={[styles.input, styles.inputShort]}
            placeholder="Max"
            placeholderTextColor={C.sub}
            value={maxAge}
            onChangeText={(t) => setMaxAge(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>

      <CollapsibleChipGroup
        label="Müzik Türleri *"
        options={GENRES}
        selected={genres}
        onToggle={(v) => toggle(v, genres, setGenres)}
      />

      <CollapsibleChipGroup
        label="Aranan Roller *"
        options={ROLES}
        selected={requiredRoles}
        onToggle={(v) => toggle(v, requiredRoles, setRequiredRoles)}
      />

      <CollapsibleChipGroup
        label="Hedefler"
        options={GOALS}
        selected={goals}
        onToggle={(v) => toggle(v, goals, setGoals)}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Bandınızı kısaca anlat..."
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
    width: 80,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageSep: { color: C.sub, fontSize: 18 },
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
