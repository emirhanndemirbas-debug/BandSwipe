import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import PhotoViewerModal from '../../components/PhotoViewerModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
};

type ProfileType = 'musician' | 'band';

interface MusicianProfile {
  name: string;
  city: string | null;
  age: number | null;
  instrument: string | null;
  skill_level: string | null;
  genres: string[];
  goals: string[];
  bio: string | null;
  avatar_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
}

interface BandProfile {
  band_name: string;
  city: string | null;
  active_since: number | null;
  genres: string[];
  required_roles: string[];
  goals: string[];
  bio: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

const SKILL_LABELS: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
  professional: 'Profesyonel',
};

export default function ProfileScreen() {
  const { session, setSession } = useAuthStore();
  const router = useRouter();

  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [musician, setMusician] = useState<MusicianProfile | null>(null);
  const [band, setBand] = useState<BandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  async function loadProfile() {
    if (!session) return;
    setLoading(true);

    const { data: meta } = await supabase
      .from('user_meta')
      .select('profile_type')
      .eq('id', session.user.id)
      .single();

    if (!meta) { setLoading(false); return; }
    setProfileType(meta.profile_type as ProfileType);

    if (meta.profile_type === 'musician') {
      const { data } = await supabase
        .from('musician_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setMusician(data);
    } else {
      const { data } = await supabase
        .from('band_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setBand(data);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [session])
  );

  async function handleSignOut() {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setSession(null);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  const avatarUrl = musician?.avatar_url ?? band?.avatar_url ?? null;
  const displayName = musician?.name ?? band?.band_name ?? '—';
  const city = musician?.city ?? band?.city ?? null;
  const bio = musician?.bio ?? band?.bio ?? null;
  const genres = musician?.genres ?? band?.genres ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setViewerUri(avatarUrl)}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {profileType === 'musician' ? 'Müzisyen' : 'Band'}
          </Text>
        </View>
      </View>

      {/* İsim & Şehir */}
      <Text style={styles.name}>{displayName}</Text>
      {city ? <Text style={styles.city}>{city}</Text> : null}

      {/* Müzisyen'e özel */}
      {musician && (
        <>
          {musician.instrument && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Enstrüman</Text>
              <Text style={styles.rowValue}>{musician.instrument}</Text>
            </View>
          )}
          {musician.skill_level && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Seviye</Text>
              <Text style={styles.rowValue}>
                {SKILL_LABELS[musician.skill_level] ?? musician.skill_level}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Band'e özel */}
      {band && (
        <>
          {band.active_since && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Kuruluş</Text>
              <Text style={styles.rowValue}>{band.active_since}</Text>
            </View>
          )}
          {band.required_roles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Aranan Roller</Text>
              <View style={styles.chips}>
                {band.required_roles.map((r) => (
                  <View key={r} style={styles.chip}>
                    <Text style={styles.chipText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* Müzik Türleri */}
      {genres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Müzik Türleri</Text>
          <View style={styles.chips}>
            {genres.map((g) => (
              <View key={g} style={[styles.chip, styles.chipAccent]}>
                <Text style={[styles.chipText, styles.chipTextAccent]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      {bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hakkında</Text>
          <Text style={styles.bio}>{bio}</Text>
        </View>
      ) : null}

      {/* Düzenle butonu */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() =>
          router.push(
            (profileType === 'musician'
              ? '/profile/edit-musician'
              : '/profile/edit-band') as any
          )
        }
        activeOpacity={0.8}
      >
        <Text style={styles.editBtnText}>Profili Düzenle</Text>
      </TouchableOpacity>

      {/* Çıkış */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>

    <PhotoViewerModal
      uri={viewerUri}
      visible={viewerUri !== null}
      onClose={() => setViewerUri(null)}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  container: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: C.accent },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: C.accent, fontSize: 38, fontWeight: '700' },
  typeBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  typeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  name: { color: C.text, fontSize: 22, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  city: { color: C.sub, fontSize: 14, marginTop: 4, marginBottom: 20 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowLabel: { color: C.sub, fontSize: 13 },
  rowValue: { color: C.text, fontSize: 13, fontWeight: '600' },

  section: { width: '100%', marginTop: 20 },
  sectionLabel: {
    color: C.sub,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#242424',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipAccent: { backgroundColor: '#3D0020', borderColor: C.accent },
  chipText: { color: C.sub, fontSize: 12, fontWeight: '500' },
  chipTextAccent: { color: C.accent },

  bio: { color: C.text, fontSize: 14, lineHeight: 21 },

  editBtn: {
    marginTop: 28,
    width: '100%',
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  signOutBtn: { marginTop: 14, width: '100%', paddingVertical: 14, alignItems: 'center' },
  signOutText: { color: C.sub, fontSize: 14 },
});
