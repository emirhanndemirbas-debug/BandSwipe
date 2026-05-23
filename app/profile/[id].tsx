import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PhotoViewerModal from '../../components/PhotoViewerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 40 - 12) / 3;
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { FeedProfile } from '../../lib/compatibility';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
};

export default function ProfileDetailScreen() {
  const { id, type, likedMe } = useLocalSearchParams<{
    id: string;
    type: 'musician' | 'band';
    likedMe?: string;
  }>();
  const router = useRouter();
  const [profile, setProfile] = useState<FeedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id || !type) return;
      const table = type === 'musician' ? 'musician_profiles' : 'band_profiles';
      const { data } = await supabase.from(table).select('*').eq('id', id).single();
      if (data) setProfile({ ...data, profile_type: type } as FeedProfile);
      setLoading(false);
    }
    load();
  }, [id, type]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Profil bulunamadı.</Text>
      </View>
    );
  }

  const name = profile.profile_type === 'musician' ? profile.name : profile.band_name;
  const instagramUrl = profile.instagram_url ?? null;
  const youtubeUrl = profile.youtube_url ?? null;
  const spotifyUrl = profile.spotify_url ?? null;

  async function openUrl(url: string | null | undefined) {
    if (!url) return;
    await WebBrowser.openBrowserAsync(url);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {likedMe === 'true' && (
          <View style={styles.likedMeBanner}>
            <Text style={styles.likedMeText}>Bu kişi seni beğendi!</Text>
            {instagramUrl ? (
              <TouchableOpacity onPress={() => openUrl(instagramUrl)}>
                <Text style={styles.likedMeAction}>Instagram'dan iletişime geç →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <View style={styles.avatarWrap}>
          {profile.avatar_url ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setViewerUri(profile.avatar_url!)}>
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                contentFit="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.heroInitial}>{name[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {profile.profile_type === 'musician' ? 'Müzisyen' : 'Band'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{name}</Text>
          {profile.city ? <Text style={styles.city}>{profile.city}</Text> : null}

          {profile.profile_type === 'musician' ? (
            <View style={styles.metaRow}>
              {profile.instrument ? (
                <Text style={styles.metaItem}>{profile.instrument}</Text>
              ) : null}
              {profile.skill_level ? (
                <Text style={styles.metaItem}>{skillLabel(profile.skill_level)}</Text>
              ) : null}
              {profile.experience_years ? (
                <Text style={styles.metaItem}>{profile.experience_years} yıl</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.metaRow}>
              {profile.active_since ? (
                <Text style={styles.metaItem}>{profile.active_since}'den beri</Text>
              ) : null}
              {profile.min_age || profile.max_age ? (
                <Text style={styles.metaItem}>
                  {profile.min_age ?? '?'}–{profile.max_age ?? '?'} yaş
                </Text>
              ) : null}
            </View>
          )}

          {profile.profile_type === 'band' && profile.required_roles.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Aranan Roller</Text>
              <View style={styles.chipRow}>
                {profile.required_roles.map((r) => (
                  <View key={r} style={styles.chip}>
                    <Text style={styles.chipText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {profile.genres.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Müzik Türleri</Text>
              <View style={styles.chipRow}>
                {profile.genres.map((g) => (
                  <View key={g} style={styles.chip}>
                    <Text style={styles.chipText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {profile.goals.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hedefler</Text>
              <View style={styles.chipRow}>
                {profile.goals.map((g) => (
                  <View key={g} style={styles.chip}>
                    <Text style={styles.chipText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {profile.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hakkında</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          ) : null}

          {profile.photos && profile.photos.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fotoğraflar</Text>
              <View style={styles.photoGrid}>
                {profile.photos.map((url, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => setViewerUri(url)}>
                    <Image
                      source={{ uri: url }}
                      style={styles.photoThumb}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.socialRow}>
            {instagramUrl ? (
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: '#DD2A7B' }]}
                onPress={() => openUrl(instagramUrl)}
              >
                <Text style={styles.socialBtnText}>Instagram</Text>
              </TouchableOpacity>
            ) : null}
            {youtubeUrl ? (
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: '#FF0000' }]}
                onPress={() => openUrl(youtubeUrl)}
              >
                <Text style={styles.socialBtnText}>YouTube</Text>
              </TouchableOpacity>
            ) : null}
            {spotifyUrl ? (
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: '#1DB954' }]}
                onPress={() => openUrl(spotifyUrl)}
              >
                <Text style={styles.socialBtnText}>Spotify</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <PhotoViewerModal
        uri={viewerUri}
        visible={viewerUri !== null}
        onClose={() => setViewerUri(null)}
      />
    </SafeAreaView>
  );
}

function skillLabel(val: string): string {
  const map: Record<string, string> = {
    beginner: 'Başlangıç',
    intermediate: 'Orta',
    advanced: 'İleri',
    professional: 'Profesyonel',
  };
  return map[val] ?? val;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.sub, fontSize: 16 },

  likedMeBanner: {
    backgroundColor: C.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  likedMeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  likedMeAction: { color: '#fff', fontSize: 13, textDecorationLine: 'underline' },

  avatarWrap: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  heroInitial: { color: C.accent, fontSize: 48, fontWeight: '700' },

  content: { padding: 20, gap: 4 },

  titleRow: { flexDirection: 'row', marginBottom: 4 },
  typeBadge: {
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  typeBadgeText: { color: C.accent, fontSize: 11, fontWeight: '600' },

  name: { color: C.text, fontSize: 26, fontWeight: '700', marginTop: 8 },
  city: { color: C.sub, fontSize: 14, marginTop: 2 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metaItem: {
    color: C.accent,
    fontSize: 13,
    backgroundColor: '#3D0020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  section: { marginTop: 20 },
  sectionLabel: {
    color: C.sub,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipText: { color: C.text, fontSize: 12 },

  bio: { color: C.sub, fontSize: 14, lineHeight: 22 },

  socialRow: { flexDirection: 'row', gap: 10, marginTop: 24, flexWrap: 'wrap' },
  socialBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  socialBtnSecondary: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  socialBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
  },
});
