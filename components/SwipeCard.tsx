import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { calculateCompatibility, FeedProfile } from '../lib/compatibility';
import CompatibilityBadge from './CompatibilityBadge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THRESHOLD = 100;

interface SwipeCardProps {
  profile: FeedProfile;
  myProfile: FeedProfile;
  onSwipe: (targetId: string, direction: 'right' | 'left') => void;
  isTop: boolean;
  onPress?: (id: string, type: 'musician' | 'band') => void;
}

export default function SwipeCard({ profile, myProfile, onSwipe, isTop, onPress }: SwipeCardProps) {
  const translateX = useSharedValue(0);

  const { score } = calculateCompatibility(myProfile, profile);

  const name = profile.profile_type === 'musician' ? profile.name : profile.band_name;
  const avatarUrl = profile.avatar_url;
  const subtitle =
    profile.profile_type === 'musician'
      ? (profile.instrument ?? 'Enstrüman belirtilmemiş')
      : profile.required_roles.join(', ') || 'Aranan rol belirtilmemiş';
  const genres = profile.genres;

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > THRESHOLD) {
        const dir = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          e.translationX > 0 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { duration: 300 },
        );
        if (dir === 'right') {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
        runOnJS(onSwipe)(profile.id, dir);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .enabled(isTop && !!onPress)
    .maxDistance(5)
    .onEnd(() => {
      if (onPress) runOnJS(onPress)(profile.id, profile.profile_type);
    });

  tapGesture.requireExternalGestureToFail(panGesture);
  const gesture = Gesture.Simultaneous(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${(translateX.value / 300) * 15}deg` },
    ],
  }));

  const greenOverlayStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / THRESHOLD) * 0.6,
  }));

  const redOverlayStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / THRESHOLD) * 0.6,
  }));

  const likeLabelStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / THRESHOLD),
  }));

  const nopeLabelStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / THRESHOLD),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{name[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        )}

        <Animated.View style={[styles.overlay, styles.greenOverlay, greenOverlayStyle]} />
        <Animated.View style={[styles.overlay, styles.redOverlay, redOverlayStyle]} />

        <Animated.View style={[styles.likeLabel, likeLabelStyle]}>
          <Text style={styles.likeLabelText}>EVET</Text>
        </Animated.View>
        <Animated.View style={[styles.nopeLabel, nopeLabelStyle]}>
          <Text style={styles.nopeLabelText}>HAYIR</Text>
        </Animated.View>

        <GestureDetector gesture={tapGesture}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            {profile.city ? <Text style={styles.city}>{profile.city}</Text> : null}
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.genreRow}>
              {genres.slice(0, 4).map((g) => (
                <View key={g} style={styles.genreChip}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
            <CompatibilityBadge score={score} />
            {profile.profile_type === 'musician' && profile.bio ? (
              <Text style={styles.bio} numberOfLines={3}>{profile.bio}</Text>
            ) : null}
            {profile.profile_type === 'band' && profile.bio ? (
              <Text style={styles.bio} numberOfLines={3}>{profile.bio}</Text>
            ) : null}
          </View>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '60%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '60%',
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 80,
    color: '#E91E8C',
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  greenOverlay: {
    backgroundColor: '#4CAF50',
  },
  redOverlay: {
    backgroundColor: '#F44336',
  },
  likeLabel: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 2,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  likeLabelText: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: '900',
  },
  nopeLabel: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 2,
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nopeLabelText: {
    color: '#F44336',
    fontSize: 32,
    fontWeight: '900',
  },
  infoContainer: {
    flex: 1,
    padding: 20,
    gap: 8,
    zIndex: 3,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  city: {
    color: '#888888',
    fontSize: 14,
  },
  subtitle: {
    color: '#E91E8C',
    fontSize: 14,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreChip: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  bio: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
  },
});
