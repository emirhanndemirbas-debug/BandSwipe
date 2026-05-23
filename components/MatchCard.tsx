import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { FeedProfile } from '../lib/compatibility';

interface MatchCardProps {
  profile: FeedProfile;
}

export default function MatchCard({ profile }: MatchCardProps) {
  const name = profile.profile_type === 'musician' ? profile.name : profile.band_name;
  const city = profile.city;
  const avatarUrl = profile.avatar_url;
  const instagramUrl = profile.instagram_url;
  const subtitle =
    profile.profile_type === 'musician' ? profile.instrument ?? 'Müzisyen' : 'Band';

  async function handleInstagram() {
    if (!instagramUrl) return;
    await WebBrowser.openBrowserAsync(instagramUrl);
  }

  return (
    <View style={styles.card}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{name?.[0] ?? '?'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle}
          {city ? ` · ${city}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.igBtn, !instagramUrl && styles.igBtnDisabled]}
        onPress={handleInstagram}
        disabled={!instagramUrl}
      >
        <Text style={styles.igText}>Instagram</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#E91E8C',
    fontSize: 22,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: '#888888',
    fontSize: 13,
    marginTop: 2,
  },
  igBtn: {
    backgroundColor: '#E91E8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  igBtnDisabled: {
    backgroundColor: '#2A2A2A',
  },
  igText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
