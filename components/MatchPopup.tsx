import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { FeedProfile } from '../lib/compatibility';

interface MatchPopupProps {
  visible: boolean;
  matchedProfile: FeedProfile | null;
  myProfile: FeedProfile | null;
  onClose: () => void;
}

export default function MatchPopup({
  visible,
  matchedProfile,
  myProfile,
  onClose,
}: MatchPopupProps) {
  if (!matchedProfile || !myProfile) return null;

  const matchedName =
    matchedProfile.profile_type === 'musician'
      ? matchedProfile.name
      : matchedProfile.band_name;
  const myName =
    myProfile.profile_type === 'musician' ? myProfile.name : myProfile.band_name;
  const instagramUrl = matchedProfile.instagram_url;

  async function handleInstagram() {
    if (!instagramUrl) return;
    onClose();
    await WebBrowser.openBrowserAsync(instagramUrl);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Eşleşme! 🎸</Text>
          <Text style={styles.subtitle}>
            Sen ve {matchedName} birbirinizi beğendiniz!
          </Text>

          <View style={styles.avatars}>
            <View style={styles.avatarWrap}>
              {myProfile.avatar_url ? (
                <Image source={{ uri: myProfile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.initial}>{myName?.[0] ?? '?'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.heart}>♥</Text>
            <View style={styles.avatarWrap}>
              {matchedProfile.avatar_url ? (
                <Image
                  source={{ uri: matchedProfile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.initial}>{matchedName?.[0] ?? '?'}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.igBtn, !instagramUrl && styles.igBtnDisabled]}
            onPress={handleInstagram}
            disabled={!instagramUrl}
          >
            <Text style={styles.igText}>Instagram'da Mesaj At</Text>
          </TouchableOpacity>

          {!instagramUrl && (
            <Text style={styles.noIg}>{matchedName} henüz Instagram eklememiş.</Text>
          )}

          <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
            <Text style={styles.laterText}>Daha Sonra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E91E8C',
    gap: 16,
  },
  title: {
    color: '#E91E8C',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  avatarWrap: {
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#E91E8C',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#E91E8C',
    fontSize: 30,
    fontWeight: '700',
  },
  heart: {
    color: '#E91E8C',
    fontSize: 28,
  },
  igBtn: {
    backgroundColor: '#E91E8C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  igBtnDisabled: {
    backgroundColor: '#2A2A2A',
  },
  igText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noIg: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterText: {
    color: '#888888',
    fontSize: 15,
  },
});
