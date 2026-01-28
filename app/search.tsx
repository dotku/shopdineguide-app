import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '@/src/components/SearchBar';
import { Colors } from '@/src/constants/colors';
import { database } from '@/src/services/database';
import type { Business } from '@/src/types/business';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setResults([]);
      setSearching(false);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await database.searchBusinesses(text);
        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const renderItem = ({ item }: { item: Business }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => {
        router.back();
        setTimeout(() => router.push(`/business/${item.id}`), 100);
      }}
    >
      <View style={styles.resultImageContainer}>
        {item.posterUrl || item.logoUrl ? (
          <Image
            source={{ uri: item.posterUrl || item.logoUrl }}
            style={styles.resultImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.resultPlaceholder}>
            <Text style={styles.resultPlaceholderText}>
              {item.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultMeta} numberOfLines={1}>
          {[item.section?.toUpperCase(), item.neighborhood || item.city]
            .filter(Boolean)
            .join(' - ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={handleSearch}
            autoFocus
            placeholder="Search restaurants, shops, services..."
          />
        </View>
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {searching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="search-outline" size={48} color={Colors.lightGray} />
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : !hasSearched ? (
        <View style={styles.centerContent}>
          <Ionicons name="search-outline" size={48} color={Colors.lightGray} />
          <Text style={styles.emptyText}>Search for businesses</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => `search-${item.id}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray,
  },
  searchContainer: {
    flex: 1,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingRight: 16,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
  },
  list: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  resultImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultPlaceholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  resultMeta: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
});
