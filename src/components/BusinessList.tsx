import { useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { BusinessCard } from './BusinessCard';
import { Colors } from '../constants/colors';
import type { Business } from '../types/business';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2;

// Derive a varied image height from the business ID
function getImageHeight(id: number): number {
  const hash = Math.abs((id * 2654435761) | 0);
  const ratio = 0.75 + (hash % 6) * 0.1; // 0.75 – 1.25
  return Math.round(CARD_WIDTH * ratio);
}

// Estimated total card height (image + info area + gap)
function estimateCardHeight(id: number): number {
  return getImageHeight(id) + 60 + CARD_GAP;
}

interface Props {
  businesses: Business[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  emptyMessage?: string;
}

export function BusinessList({
  businesses,
  loading,
  onLoadMore,
  hasMore,
  ListHeaderComponent,
  emptyMessage = 'No businesses found',
}: Props) {
  const loadingMore = useRef(false);

  // Split into two columns, balancing by estimated height
  const leftColumn: Business[] = [];
  const rightColumn: Business[] = [];
  let leftH = 0;
  let rightH = 0;

  for (const biz of businesses) {
    const h = estimateCardHeight(biz.id);
    if (leftH <= rightH) {
      leftColumn.push(biz);
      leftH += h;
    } else {
      rightColumn.push(biz);
      rightH += h;
    }
  }

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMore || !onLoadMore || loadingMore.current) return;
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromBottom < 400) {
        loadingMore.current = true;
        onLoadMore();
        setTimeout(() => {
          loadingMore.current = false;
        }, 500);
      }
    },
    [hasMore, onLoadMore]
  );

  // Initial loading
  if (loading && businesses.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {ListHeaderComponent}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </ScrollView>
    );
  }

  // Empty state
  if (!loading && businesses.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {ListHeaderComponent}
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      {ListHeaderComponent}
      <View style={styles.masonry}>
        <View style={styles.column}>
          {leftColumn.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              width={CARD_WIDTH}
              imageHeight={getImageHeight(biz.id)}
            />
          ))}
        </View>
        <View style={styles.column}>
          {rightColumn.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              width={CARD_WIDTH}
              imageHeight={getImageHeight(biz.id)}
            />
          ))}
        </View>
      </View>
      {loading && businesses.length > 0 ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: CARD_GAP,
    paddingBottom: 20,
    flexGrow: 1,
  },
  masonry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: CARD_WIDTH,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 12,
  },
});
