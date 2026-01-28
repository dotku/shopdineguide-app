import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import type { ContentFilter } from '../types/business';

const FILTERS: { key: ContentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot' },
  { key: 'free', label: 'Free' },
  { key: 'deals', label: 'Deals' },
  { key: 'coupons', label: 'Coupons' },
];

interface Props {
  activeFilter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  chipTextActive: {
    color: Colors.white,
  },
});
