import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../lib/store';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession, onboardingCompleted, setOnboardingCompleted } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        try {
          const { data } = await supabase
            .from('user_meta')
            .select('onboarding_completed')
            .eq('id', newSession.user.id)
            .single();
          setOnboardingCompleted(data?.onboarding_completed ?? false);
        } catch {
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    if (onboardingCompleted === undefined) return;

    if (!onboardingCompleted) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/profile-type');
      return;
    }

    if (inAuthGroup || inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, onboardingCompleted]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
