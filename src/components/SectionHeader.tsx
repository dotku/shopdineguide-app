import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  title: string;
  onSeeAll?: () => void;
  count?: number;
}

export function SectionHeader({ title, onSeeAll, count }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined ? <Text style={styles.count}>({count})</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  count: {
    fontSize: 14,
    color: Colors.gray,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
