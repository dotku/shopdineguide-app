import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/services/database';
import type { Business } from '@/src/types/business';

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      console.log('📚 Loading bookmarks...');
      const data = await database.getBookmarkedBusinesses();
      console.log('=== BOOKMARKS DEBUG ===');
      console.log('Total bookmarks:', data.length);
      console.log('Bookmark details:');
      data.forEach((b, index) => {
        console.log(`  ${index + 1}. ID: ${b.id}, Name: ${b.name}`);
      });
      
      // 检查是否有重复 ID
      const ids = data.map(b => b.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.error('⚠️ DUPLICATE IDS FOUND!');
        console.log('Duplicates:', ids.filter((id, index) => ids.indexOf(id) !== index));
      }
      setBookmarks(data);
    } catch (error) {
      console.error('Load bookmarks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (businessId: number) => {
    try {
      console.log(`🗑️ Removing bookmark: ${businessId}`);
      await database.toggleBookmark(businessId);
      console.log('✅ Bookmark removed, reloading...');

      await loadBookmarks();
    } catch (error) {
      console.error('Remove bookmark error:', error);
    }
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => {
        console.log(`📱 Opening business: ${item.id} - ${item.name}`);
        router.push(`/business/${item.id}`)}}
    >
      <View style={styles.cardContent}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Ionicons name="business" size={30} color="#999" />
          </View>
        )}
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.section}>{item.section}</Text>
          {item.address && (
            <Text style={styles.address} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#666" /> {item.address}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleRemoveBookmark(item.id)}
          style={styles.bookmarkButton}
        >
          <Ionicons name="bookmark" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
      <Text style={styles.emptyText}>
        Start bookmarking your favorite businesses to see them here
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.exploreButtonText}>Explore Businesses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookmarks</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBusinessItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={bookmarks.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  logoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  section: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#666',
  },
  bookmarkButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});