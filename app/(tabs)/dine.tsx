import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '@/src/components/SearchBar';
import { FilterBar } from '@/src/components/FilterBar';
import { LocationPicker } from '@/src/components/LocationPicker';
import { CategoryPills } from '@/src/components/CategoryPills';
import { BusinessList } from '@/src/components/BusinessList';
import { Colors } from '@/src/constants/colors';
import { database } from '@/src/services/database';
import { useAppStore } from '@/src/hooks/useAppStore';
import type { Business } from '@/src/types/business';

const PAGE_SIZE = 20;

export default function DineScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isDbReady = useAppStore((s) => s.isDbReady);
  const {
    activeFilter,
    activeCity,
    activeNeighborhood,
    activeCategory,
    setActiveFilter,
    setActiveCity,
    setActiveNeighborhood,
    setActiveCategory,
  } = useAppStore();

  const loadBusinesses = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const results = await database.getBusinessesBySection(
          'dine',
          activeFilter,
          activeCity || undefined,
          activeNeighborhood || undefined,
          activeCategory || undefined,
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
        console.error('Failed to load dine businesses:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, activeCity, activeNeighborhood, activeCategory]
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
      <CategoryPills activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
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
        emptyMessage="No restaurants found"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
