import { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { generateEmbedding } from '../../lib/embedding';
import CollapsibleChipGroup from '../../components/CollapsibleChipGroup';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_COUNT = 5;
const PHOTO_SIZE = (SCREEN_WIDTH - 48 - 16) / 3;

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

export default function EditMusicianScreen() {
  const { session } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Profil' });
  }, [navigation, router]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [localAvatarBase64, setLocalAvatarBase64] = useState<string | null>(null);

  const [photos, setPhotos] = useState<(string | null)[]>(Array(PHOTO_COUNT).fill(null));
  const [localPhotos, setLocalPhotos] = useState<(string | null)[]>(Array(PHOTO_COUNT).fill(null));
  const [localPhotosBase64, setLocalPhotosBase64] = useState<(string | null)[]>(Array(PHOTO_COUNT).fill(null));

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [instrument, setInstrument] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!session) return;
      const { data } = await supabase
        .from('musician_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setAvatarUrl(data.avatar_url ?? null);
        setName(data.name ?? '');
        setCity(data.city ?? '');
        setAge(data.age ? String(data.age) : '');
        setInstrument(data.instrument ? [data.instrument] : []);
        setSkillLevel(data.skill_level ? [data.skill_level] : []);
        setGenres(data.genres ?? []);
        setGoals(data.goals ?? []);
        setBio(data.bio ?? '');
        setSpotifyUrl(data.spotify_url ?? '');
        setYoutubeUrl(data.youtube_url ?? '');
        setInstagramUrl(data.instagram_url ?? '');
        const dbPhotos: string[] = data.photos ?? [];
        setPhotos(Array(PHOTO_COUNT).fill(null).map((_, i) => dbPhotos[i] ?? null));
      }
      setLoading(false);
    }
    fetchProfile();
  }, [session]);

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimine izin ver.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      setLocalAvatarUri(result.assets[0].uri);
      setLocalAvatarBase64(result.assets[0].base64 ?? null);
    }
  }

  async function pickPhoto(index: number) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimine izin ver.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      setLocalPhotos((prev) => { const next = [...prev]; next[index] = result.assets[0].uri; return next; });
      setLocalPhotosBase64((prev) => { const next = [...prev]; next[index] = result.assets[0].base64 ?? null; return next; });
    }
  }

  function deletePhoto(index: number) {
    setPhotos((prev) => { const next = [...prev]; next[index] = null; return next; });
    setLocalPhotos((prev) => { const next = [...prev]; next[index] = null; return next; });
    setLocalPhotosBase64((prev) => { const next = [...prev]; next[index] = null; return next; });
  }

  async function uploadBase64(base64: string, path: string, mimeType: string): Promise<boolean> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, { contentType: mimeType, upsert: true });
    return !error;
  }

  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!localAvatarBase64) return avatarUrl;
    const path = `${userId}/avatar.jpg`;
    const ok = await uploadBase64(localAvatarBase64, path, 'image/jpeg');
    if (!ok) { Alert.alert('Avatar Hatası', 'Fotoğraf yüklenemedi.'); return avatarUrl; }
    return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }

  async function uploadPhotos(userId: string): Promise<(string | null)[]> {
    const result = [...photos];
    await Promise.all(
      localPhotosBase64.map(async (b64, index) => {
        if (!b64) return;
        const filePath = `${userId}/photo_${index}.jpg`;
        const ok = await uploadBase64(b64, filePath, 'image/jpeg');
        if (ok) {
          result[index] = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        }
      }),
    );
    return result;
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Eksik', 'İsim zorunludur.'); return; }
    if (!city.trim()) { Alert.alert('Eksik', 'Şehir zorunludur.'); return; }
    if (!age.trim()) { Alert.alert('Eksik', 'Yaş zorunludur.'); return; }
    if (instrument.length === 0) { Alert.alert('Eksik', 'En az bir enstrüman seç.'); return; }
    if (genres.length === 0) { Alert.alert('Eksik', 'En az bir müzik türü seç.'); return; }
    if (skillLevel.length === 0) { Alert.alert('Eksik', 'Seviye seç.'); return; }

    setSaving(true);
    const userId = session!.user.id;
    const newAvatarUrl = await uploadAvatar(userId);
    const finalPhotos = await uploadPhotos(userId);

    const { error } = await supabase.from('musician_profiles').upsert({
      id: userId,
      name: name.trim(),
      city: city.trim(),
      age: age ? parseInt(age, 10) : null,
      instrument: instrument[0],
      skill_level: skillLevel[0],
      genres,
      goals,
      bio: bio.trim() || null,
      avatar_url: newAvatarUrl,
      photos: finalPhotos.filter(Boolean),
      spotify_url: spotifyUrl.trim() || null,
      youtube_url: youtubeUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
    });

    setSaving(false);
    if (error) { Alert.alert('Hata', error.message); return; }
    if (session) void generateEmbedding(session.user.id, 'musician');
    router.back();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  const displayAvatar = localAvatarUri ?? avatarUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} hitSlop={12}>
        <Ionicons name="close" size={26} color="#FFFFFF" />
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        {/* Profil Fotoğrafı */}
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>Değiştir</Text>
          </View>
        </TouchableOpacity>

        {/* Fotoğraf Galerisi */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fotoğraflar</Text>
          <View style={styles.photoGrid}>
            {Array(PHOTO_COUNT).fill(null).map((_, index) => {
              const localUri = localPhotos[index];
              const remoteUrl = photos[index];
              const displayUri = localUri ?? remoteUrl;
              return (
                <View key={index} style={styles.photoSlot}>
                  {displayUri ? (
                    <>
                      <Image
                        source={{ uri: displayUri }}
                        style={styles.photoImage}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        style={styles.photoDelete}
                        onPress={() => deletePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={22} color="#fff" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.photoEmpty}
                      onPress={() => pickPhoto(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={28} color={C.sub} />
                    </TouchableOpacity>
                  )}
                  {displayUri ? (
                    <TouchableOpacity
                      style={StyleSheet.absoluteFill}
                      onPress={() => pickPhoto(index)}
                      activeOpacity={0.8}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

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
          onToggle={(v) => setInstrument([v])}
          single
          collapsible
        />

        <CollapsibleChipGroup
          label="Seviye *"
          options={SKILL_LEVELS.map((s) => s.label)}
          selected={SKILL_LEVELS.filter((s) => skillLevel.includes(s.value)).map((s) => s.label)}
          onToggle={(lbl) => {
            const found = SKILL_LEVELS.find((s) => s.label === lbl);
            if (found) setSkillLevel([found.value]);
          }}
          single
          collapsible
        />

        <CollapsibleChipGroup
          label="Müzik Türleri *"
          options={GENRES}
          selected={genres}
          onToggle={(v) =>
            setGenres((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])
          }
          collapsible
        />

        <CollapsibleChipGroup
          label="Hedefler"
          options={GOALS}
          selected={goals}
          onToggle={(v) =>
            setGoals((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])
          }
          collapsible
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

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#1DB954' }]}>Spotify URL</Text>
          <TextInput
            style={[styles.input, { borderColor: '#1DB954' }]}
            placeholder="https://open.spotify.com/artist/..."
            placeholderTextColor={C.sub}
            value={spotifyUrl}
            onChangeText={setSpotifyUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#FF0000' }]}>YouTube URL</Text>
          <TextInput
            style={[styles.input, { borderColor: '#FF0000' }]}
            placeholder="https://youtube.com/..."
            placeholderTextColor={C.sub}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#DD2A7B' }]}>Instagram URL</Text>
          <TextInput
            style={[styles.input, { borderColor: '#DD2A7B' }]}
            placeholder="https://instagram.com/..."
            placeholderTextColor={C.sub}
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kaydet</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  container: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  avatarWrap: { position: 'relative', marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: C.accent },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.surface, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: C.accent, fontSize: 32, fontWeight: '700' },
  avatarOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderBottomLeftRadius: 45, borderBottomRightRadius: 45,
    alignItems: 'center', paddingVertical: 4,
  },
  avatarOverlayText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  section: { marginBottom: 24, width: '100%' },
  sectionLabel: {
    color: C.sub, fontSize: 12, fontWeight: '600',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10,
  },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    borderRadius: 10, overflow: 'hidden',
    position: 'relative',
  },
  photoImage: { width: '100%', height: '100%' },
  photoEmpty: {
    width: '100%', height: '100%',
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, borderRadius: 10,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  photoDelete: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12, zIndex: 10,
  },

  input: {
    backgroundColor: C.input, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, color: C.text, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
  },
  inputShort: { width: 100 },
  inputMultiline: { minHeight: 100, paddingTop: 13 },
  btn: {
    backgroundColor: C.accent, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, width: '100%',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
