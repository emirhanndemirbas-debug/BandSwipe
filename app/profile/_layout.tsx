import { Stack } from 'expo-router';

export default function ProfileEditLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0D0D0D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Geri',
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    />
  );
}
