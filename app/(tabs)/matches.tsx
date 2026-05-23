import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { FeedProfile } from '../../lib/compatibility';
import { fetchProfilesByIds } from '../../lib/profileUtils';
import ProfileListCard from '../../components/ProfileListCard';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
};

type TabKey = 'matches' | 'liked' | 'liked-me' | 'passed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'matches', label: 'Eşleşmeler' },
  { key: 'liked', label: 'Beğendiklerim' },
  { key: 'liked-me', label: 'Beni Beğenenler' },
];

export default function MatchesScreen() {
  const { session, resetMatchCount } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('matches');
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [profiles, setProfiles] = useState<FeedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTab = useCallback(
    async (tab: TabKey) => {
      if (!session) return;
      setLoading(true);
      const me = session.user.id;

      try {
        if (tab === 'matches') {
          const { data: matchRows } = await supabase
            .from('matches')
            .select('user1_id,user2_id')
            .or(`user1_id.eq.${me},user2_id.eq.${me}`);

          if (!matchRows || matchRows.length === 0) { setProfiles([]); return; }

          const otherIds = [
            ...new Set(
              matchRows.map((r: { user1_id: string; user2_id: string }) =>
                r.user1_id === me ? r.user2_id : r.user1_id,
              ),
            ),
          ] as string[];

          setProfiles(await fetchProfilesByIds(otherIds));
        } else if (tab === 'liked') {
          const { data: swipes } = await supabase
            .from('swipes')
            .select('target_id')
            .eq('actor_id', me)
            .eq('direction', 'right');

          const { data: matchRows } = await supabase
            .from('matches')
            .select('user1_id,user2_id')
            .or(`user1_id.eq.${me},user2_id.eq.${me}`);

          const matchedIds = new Set(
            (matchRows ?? []).map((r: { user1_id: string; user2_id: string }) =>
              r.user1_id === me ? r.user2_id : r.user1_id,
            ),
          );

          const ids = (swipes ?? [])
            .map((s: { target_id: string }) => s.target_id)
            .filter((id: string) => !matchedIds.has(id));

          setProfiles(await fetchProfilesByIds(ids));
        } else if (tab === 'liked-me') {
          const { data: swipes } = await supabase
            .from('swipes')
            .select('actor_id')
            .eq('target_id', me)
            .eq('direction', 'right');

          const { data: mySwipes } = await supabase
            .from('swipes')
            .select('target_id')
            .eq('actor_id', me);

          const mySwiped = new Set(
            (mySwipes ?? []).map((s: { target_id: string }) => s.target_id),
          );

          const ids = (swipes ?? [])
            .map((s: { actor_id: string }) => s.actor_id)
            .filter((id: string) => !mySwiped.has(id));

          setProfiles(await fetchProfilesByIds(ids));
        } else if (tab === 'passed') {
          const { data: swipes } = await supabase
            .from('swipes')
            .select('target_id')
            .eq('actor_id', me)
            .eq('direction', 'left');

          const ids = (swipes ?? []).map((s: { target_id: string }) => s.target_id);
          setProfiles(await fetchProfilesByIds(ids));
        }
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  useFocusEffect(
    useCallback(() => {
      void loadTab(activeTab);
      resetMatchCount();
    }, [loadTab, activeTab]),
  );

  function switchTab(tab: TabKey) {
    setActiveTab(tab);
    void loadTab(tab);
  }

  function openProfile(profile: FeedProfile, likedMe = false) {
    router.push({
      pathname: '/profile/[id]',
      params: { id: profile.id, type: profile.profile_type, likedMe: likedMe ? 'true' : 'false' },
    });
  }

  async function openInstagram(profile: FeedProfile) {
    if (profile.instagram_url) await WebBrowser.openBrowserAsync(profile.instagram_url);
  }

  function handleDelete(profile: FeedProfile, tab: TabKey) {
    const me = session!.user.id;

    const doDelete = async () => {
      if (tab === 'matches') {
        await supabase.from('swipes').delete()
          .eq('actor_id', me).eq('target_id', profile.id).eq('direction', 'right');
        await supabase.from('swipes').delete()
          .eq('actor_id', profile.id).eq('target_id', me).eq('direction', 'right');
      } else if (tab === 'liked') {
        await supabase.from('swipes').delete()
          .eq('actor_id', me).eq('target_id', profile.id).eq('direction', 'right');
      } else if (tab === 'passed') {
        await supabase.from('swipes').delete()
          .eq('actor_id', me).eq('target_id', profile.id).eq('direction', 'left');
      } else if (tab === 'liked-me') {
        await supabase.from('swipes').upsert({
          actor_id: me,
          target_id: profile.id,
          direction: 'left',
        });
      }
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    };

    if (tab === 'matches') {
      Alert.alert('Eşleşmeyi Kaldır', 'Bu eşleşme silinecek, emin misin?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: doDelete },
      ]);
    } else {
      void doDelete();
    }
  }

  const emptyMessages: Record<TabKey, string> = {
    matches: 'Henüz eşleşmen yok. Feed\'de sağa swipe yapmaya devam et!',
    liked: 'Henüz sağa swipe yapmadın.',
    'liked-me': 'Henüz seni beğenen yok.',
    passed: 'Henüz geçtiğin profil yok.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Eşleşmeler</Text>
        <TouchableOpacity
          style={styles.dotsBtn}
          onPress={() => setShowDotsMenu(true)}
        >
          <Text style={styles.dotsBtnText}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => switchTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{emptyMessages[activeTab]}</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProfileListCard
              profile={item}
              mode={activeTab === 'liked-me' ? 'liked-me' : activeTab === 'passed' ? 'passed' : activeTab === 'liked' ? 'liked' : 'match'}
              onPress={() => openProfile(item, activeTab === 'liked-me')}
              onInstagram={activeTab === 'matches' ? () => openInstagram(item) : undefined}
              onDelete={() => handleDelete(item, activeTab)}
            />
          )}
        />
      )}

      <Modal
        visible={showDotsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDotsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDotsMenu(false)}
        >
          <View style={styles.dotsMenu}>
            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                setShowDotsMenu(false);
                switchTab('passed');
              }}
            >
              <Text style={styles.dotsMenuItemText}>Beğenmediklerim</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: { color: C.text, fontSize: 24, fontWeight: '700' },
  dotsBtn: { padding: 8 },
  dotsBtnText: { color: C.sub, fontSize: 18, letterSpacing: 2 },

  tabBar: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignSelf: 'flex-start',
  },
  tabActive: { backgroundColor: C.accent, borderColor: C.accent },
  tabText: { color: C.sub, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: { color: C.sub, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
  },
  dotsMenu: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 160,
    overflow: 'hidden',
  },
  dotsMenuItem: { paddingHorizontal: 20, paddingVertical: 14 },
  dotsMenuItemText: { color: C.text, fontSize: 14 },
});
