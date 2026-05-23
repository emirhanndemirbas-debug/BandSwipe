import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FeedProfile } from '../lib/compatibility';

const C = {
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
};

interface ProfileListCardProps {
  profile: FeedProfile;
  mode: 'match' | 'liked' | 'passed' | 'liked-me';
  onPress: () => void;
  onDelete?: () => void;
  onInstagram?: () => void;
}

export default function ProfileListCard({
  profile,
  mode,
  onPress,
  onDelete,
  onInstagram,
}: ProfileListCardProps) {
  const name = profile.profile_type === 'musician' ? profile.name : profile.band_name;
  const subtitle =
    profile.profile_type === 'musician'
      ? (profile.instrument ?? profile.city ?? '')
      : (profile.city ?? '');

  const isPassed = mode === 'passed';

  return (
    <View style={[styles.card, isPassed && styles.cardPassed, mode === 'liked-me' && styles.cardLikedMe]}>
      <TouchableOpacity style={styles.cardInner} onPress={onPress} activeOpacity={0.75}>
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={[styles.avatar, isPassed && styles.avatarPassed]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, isPassed && styles.avatarPassed]}>
            <Text style={styles.avatarInitial}>{name[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.name, isPassed && styles.namePassed]}>{name}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {mode === 'liked-me' ? (
            <Text style={styles.likedMeLabel}>Seni beğendi ♥</Text>
          ) : mode === 'passed' ? (
            <Text style={styles.passedLabel}>Geçtim</Text>
          ) : null}
        </View>

        {mode === 'match' && onInstagram ? (
          <TouchableOpacity style={styles.igBtn} onPress={onInstagram}>
            <Text style={styles.igBtnText}>Instagram</Text>
          </TouchableOpacity>
        ) : mode === 'liked' ? (
          <Text style={styles.heartIcon}>♥</Text>
        ) : null}
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={C.sub} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  cardPassed: { opacity: 0.5 },
  cardLikedMe: { borderColor: C.accent },

  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    paddingRight: 40,
  },

  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPassed: { opacity: 0.6 },
  avatarPlaceholder: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: C.accent, fontSize: 22, fontWeight: '700' },

  info: { flex: 1, gap: 2 },
  name: { color: C.text, fontSize: 15, fontWeight: '600' },
  namePassed: { color: C.sub },
  subtitle: { color: C.sub, fontSize: 13 },
  likedMeLabel: { color: C.accent, fontSize: 12, fontWeight: '600' },
  passedLabel: { color: C.sub, fontSize: 12 },

  igBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  igBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heartIcon: { color: C.accent, fontSize: 20 },

  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
