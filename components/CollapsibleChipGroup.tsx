import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const C = {
  bg: '#1A1A1A',
  sub: '#888888',
  border: '#2A2A2A',
  borderActive: '#3D3D3D',
  chip: '#242424',
  chipActive: '#3D0020',
  chipTextActive: '#E91E8C',
  accent: '#E91E8C',
  text: '#FFFFFF',
};

interface CollapsibleChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  single?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function CollapsibleChipGroup({
  label,
  options,
  selected,
  onToggle,
  collapsible = false,
  defaultExpanded = false,
}: CollapsibleChipGroupProps) {
  const [expanded, setExpanded] = useState(!collapsible || defaultExpanded);

  function toggle() {
    if (!collapsible) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }

  const chips = (
    <View style={styles.chipsWrap}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!collapsible) {
    return (
      <View style={styles.section}>
        <Text style={styles.plainLabel}>{label}</Text>
        {chips}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.header, expanded && styles.headerExpanded]}
        onPress={toggle}
        activeOpacity={0.75}
      >
        <Text style={styles.headerLabel}>{label}</Text>
        <View style={styles.headerRight}>
          {selected.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{selected.length} seçili</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={C.sub}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.chipsContainer}>
          {chips}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },

  plainLabel: {
    color: C.sub,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  headerLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#3D0020',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: { marginLeft: 2 },

  chipsContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    backgroundColor: C.bg,
  },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: C.chip,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.chipActive, borderColor: C.accent },
  chipText: { color: C.sub, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: C.chipTextActive },
});
