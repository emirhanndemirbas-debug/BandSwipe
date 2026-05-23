import { StyleSheet, Text, View } from 'react-native';

interface Props {
  score: number;
}

export default function CompatibilityBadge({ score }: Props) {
  const color = score >= 70 ? '#4CAF50' : score >= 40 ? '#FFC107' : '#FF6B35';
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>%{score} uyum</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
