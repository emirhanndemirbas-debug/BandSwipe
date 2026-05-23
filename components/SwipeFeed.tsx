import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { FeedProfile } from '../lib/compatibility';
import SwipeCard from './SwipeCard';
import MatchPopup from './MatchPopup';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAGE_SIZE = 20;

export default function SwipeFeed() {
  const { session, incrementMatchCount } = useAuthStore();
  const router = useRouter();
  const [profiles, setProfiles] = useState<FeedProfile[]>([]);
  const [myProfile, setMyProfile] = useState<FeedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSwiped, setAllSwiped] = useState(false);
  const [matchPopup, setMatchPopup] = useState<FeedProfile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const swipedIdsRef = useRef<Set<string>>(new Set());
  const rawOffsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const targetTableRef = useRef<'musician_profiles' | 'band_profiles'>('band_profiles');
  const targetTypeRef = useRef<'musician' | 'band'>('band');

  useEffect(() => {
    if (session) loadFeed();
  }, [session]);

  async function loadFeed() {
    if (!session) return;
    setLoading(true);
    setAllSwiped(false);
    setCurrentIndex(0);
    rawOffsetRef.current = 0;
    hasMoreRef.current = true;

    try {
      const userId = session.user.id;

      const { data: meta } = await supabase
        .from('user_meta')
        .select('profile_type')
        .eq('id', userId)
        .single();

      if (!meta) return;
      const profileType = meta.profile_type as 'musician' | 'band';

      const myTable = profileType === 'musician' ? 'musician_profiles' : 'band_profiles';
      const { data: myData } = await supabase.from(myTable).select('*').eq('id', userId).single();
      if (!myData) return;
      setMyProfile({ ...myData, profile_type: profileType } as FeedProfile);

      const { data: swipedData } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('actor_id', userId);
      const swipedIds = new Set<string>((swipedData ?? []).map((s: { target_id: string }) => s.target_id));
      swipedIds.add(userId);
      swipedIdsRef.current = swipedIds;

      const tTable = profileType === 'musician' ? 'band_profiles' : 'musician_profiles';
      const tType: 'musician' | 'band' = profileType === 'musician' ? 'band' : 'musician';
      targetTableRef.current = tTable;
      targetTypeRef.current = tType;

      const { data: feedData } = await supabase
        .from(tTable)
        .select('*')
        .range(0, PAGE_SIZE - 1);

      rawOffsetRef.current = PAGE_SIZE;
      hasMoreRef.current = (feedData ?? []).length === PAGE_SIZE;

      const filtered = (feedData ?? [])
        .filter((p: { id: string }) => !swipedIds.has(p.id))
        .map((p: Record<string, unknown>) => ({ ...p, profile_type: tType } as FeedProfile));

      setProfiles(filtered);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMoreRef.current || !session) return;
    setLoadingMore(true);
    try {
      const start = rawOffsetRef.current;
      const end = start + PAGE_SIZE - 1;
      const { data: feedData } = await supabase
        .from(targetTableRef.current)
        .select('*')
        .range(start, end);

      rawOffsetRef.current = start + PAGE_SIZE;
      hasMoreRef.current = (feedData ?? []).length === PAGE_SIZE;

      const filtered = (feedData ?? [])
        .filter((p: { id: string }) => !swipedIdsRef.current.has(p.id))
        .map((p: Record<string, unknown>) => ({ ...p, profile_type: targetTypeRef.current } as FeedProfile));

      setProfiles((prev) => [...prev, ...filtered]);
    } finally {
      setLoadingMore(false);
    }
  }

  const handleSwipe = useCallback(
    async (targetId: string, direction: 'right' | 'left') => {
      if (!session) return;
      swipedIdsRef.current.add(targetId);

      const next = currentIndex + 1;
      if (next >= profiles.length) {
        if (hasMoreRef.current) {
          await loadMore();
        } else {
          setAllSwiped(true);
        }
      } else {
        setCurrentIndex(next);
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
      }
      await supabase.from('swipes').insert({
        actor_id: session.user.id,
        target_id: targetId,
        direction,
      });

      if (direction === 'right') {
        const { data: matchData } = await supabase
          .from('matches')
          .select('user1_id,user2_id')
          .eq('user1_id', session.user.id)
          .eq('user2_id', targetId)
          .maybeSingle();
        if (matchData) {
          const matched = profiles.find((p) => p.id === targetId) ?? null;
          setMatchPopup(matched);
          incrementMatchCount();
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    },
    [session, currentIndex, profiles],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  if (!myProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Profil bulunamadı.</Text>
        <Text style={styles.emptySubText}>Önce onboarding'i tamamlamalısın.</Text>
      </View>
    );
  }

  if (allSwiped || profiles.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Şu an gösterilecek profil yok</Text>
        <Text style={styles.emptySubText}>Yeni profiller eklendiğinde burada görünür.</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadFeed}>
          <Text style={styles.refreshText}>Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={profiles}
        keyExtractor={(p) => p.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <SwipeCard
            profile={item}
            myProfile={myProfile}
            onSwipe={handleSwipe}
            isTop={index === currentIndex}
            onPress={(id, type) =>
              router.push({ pathname: '/profile/[id]', params: { id, type } })
            }
          />
        )}
        getItemLayout={(_, i) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * i,
          index: i,
        })}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#E91E8C" />
            </View>
          ) : null
        }
      />
      <MatchPopup
        visible={matchPopup !== null}
        matchedProfile={matchPopup}
        myProfile={myProfile}
        onClose={() => setMatchPopup(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#888888',
    fontSize: 14,
  },
  refreshBtn: {
    marginTop: 8,
    backgroundColor: '#E91E8C',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    height: SCREEN_HEIGHT * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
