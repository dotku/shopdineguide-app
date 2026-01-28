import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '@/src/components/SearchBar';
import { FilterBar } from '@/src/components/FilterBar';
import { LocationPicker } from '@/src/components/LocationPicker';
import { BusinessList } from '@/src/components/BusinessList';
import { Colors } from '@/src/constants/colors';
import { database } from '@/src/services/database';
import { useAppStore } from '@/src/hooks/useAppStore';
import type { Business, ContentFilter } from '@/src/types/business';

const PAGE_SIZE = 20;

export default function DealsScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isDbReady = useAppStore((s) => s.isDbReady);
  const { activeFilter, activeCity, activeNeighborhood, setActiveFilter, setActiveCity, setActiveNeighborhood } = useAppStore();

  const loadBusinesses = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const results = await database.getBusinessesBySection(
          undefined,
          activeFilter,
          activeCity || undefined,
          activeNeighborhood || undefined,
          undefined,
          PAGE_SIZE,
          pageNum * PAGE_SIZE
        );
        if (append) {
          setBusinesses((prev) => [...prev, ...results]);
        } else {
          setBusinesses(results);
        }
        setHasMore(results.length === PAGE_SIZE);
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, activeCity, activeNeighborhood]
  );

  useEffect(() => {
    if (isDbReady) {
      setPage(0);
      loadBusinesses(0);
    }
  }, [isDbReady, loadBusinesses]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadBusinesses(nextPage, true);
    }
  }, [page, loading, hasMore, loadBusinesses]);

  const header = (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Deals & Popular</Text>
        <Text style={styles.headerSubtitle}>
          Top-rated businesses in the Bay Area
        </Text>
      </View>
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <LocationPicker
        activeCity={activeCity}
        activeNeighborhood={activeNeighborhood}
        onCityChange={setActiveCity}
        onNeighborhoodChange={setActiveNeighborhood}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar navigateOnPress />
      <BusinessList
        businesses={businesses}
        loading={loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
        ListHeaderComponent={header}
        emptyMessage="No deals found"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
});
