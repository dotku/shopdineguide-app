import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { FOOD_CATEGORIES } from '../constants/categories';

interface Props {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryPills({ activeCategory, onCategoryChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Pressable
        style={[styles.pill, !activeCategory && styles.pillActive]}
        onPress={() => onCategoryChange(null)}
      >
        <Text style={[styles.pillText, !activeCategory && styles.pillTextActive]}>All</Text>
      </Pressable>
      {FOOD_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <Pressable
            key={cat.slug}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onCategoryChange(isActive ? null : cat.slug)}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cat.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.dine,
    borderColor: Colors.dine,
  },
  pillText: {
    fontSize: 13,
    color: Colors.dark,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});
