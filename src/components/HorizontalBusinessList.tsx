import { FlatList, StyleSheet, Dimensions } from 'react-native';
import { BusinessCard } from './BusinessCard';
import { Colors } from '../constants/colors';
import type { Business } from '../types/business';

const CARD_WIDTH = Dimensions.get('window').width * 0.42;

interface Props {
  businesses: Business[];
}

export function HorizontalBusinessList({ businesses }: Props) {
  return (
    <FlatList
      data={businesses}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => `h-${item.id}`}
      renderItem={({ item }) => <BusinessCard business={item} width={CARD_WIDTH} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    gap: 10,
  },
});
