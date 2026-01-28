import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { database } from '@/src/services/database';
import { formatPhone, callPhone, openUrl, openMaps, parseJsonField } from '@/src/utils/helpers';
import type { Business } from '@/src/types/business';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const biz = await database.getBusinessById(Number(id));
        setBusiness(biz);
        if (biz) {
          const isBookmarked = await database.isBookmarked(biz.id);
          setBookmarked(isBookmarked);
        }
      } catch (err) {
        console.error('Failed to load business:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleBookmark = async () => {
    if (!business) return;
    const result = await database.toggleBookmark(business.id);
    setBookmarked(result);
  };

  const handleShare = async () => {
    if (!business) return;
    try {
      await Share.share({
        message: `Check out ${business.name} on ShopDineGuide!${business.address ? `\n${business.address}` : ''}`,
        title: business.name,
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Business not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const galleryUrls = parseJsonField<string[]>(business.galleryUrls, []);
  const allImages = [
    business.posterUrl,
    business.bannerUrl,
    ...galleryUrls,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable onPress={handleBookmark} style={styles.headerBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? Colors.secondary : Colors.dark}
            />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.headerBtn}>
            <Ionicons name="share-outline" size={22} color={Colors.dark} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {allImages.length > 0 ? (
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setGalleryIndex(idx);
              }}
            >
              {allImages.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={styles.galleryImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
            {allImages.length > 1 ? (
              <View style={styles.paginationDots}>
                {allImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === galleryIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            {business.logoUrl ? (
              <Image
                source={{ uri: business.logoUrl }}
                style={styles.logoLarge}
                contentFit="contain"
              />
            ) : (
              <Text style={styles.placeholderLetter}>
                {business.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
        )}

        {/* Business Info */}
        <View style={styles.infoSection}>
          <Text style={styles.businessName}>{business.name}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{business.section.toUpperCase()}</Text>
          </View>

          {business.address ? (
            <Pressable style={styles.infoRow} onPress={() => openMaps(business.address!)}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{business.address}</Text>
              <Ionicons name="open-outline" size={14} color={Colors.gray} />
            </Pressable>
          ) : null}

          {business.phone ? (
            <Pressable style={styles.infoRow} onPress={() => callPhone(business.phone!)}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{formatPhone(business.phone)}</Text>
              <Ionicons name="open-outline" size={14} color={Colors.gray} />
            </Pressable>
          ) : null}

          {business.website ? (
            <Pressable style={styles.infoRow} onPress={() => openUrl(business.website!)}>
              <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {business.website.replace(/^https?:\/\/(www\.)?/, '')}
              </Text>
              <Ionicons name="open-outline" size={14} color={Colors.gray} />
            </Pressable>
          ) : null}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {business.phone ? (
            <Pressable style={styles.actionBtn} onPress={() => callPhone(business.phone!)}>
              <Ionicons name="call" size={22} color={Colors.primary} />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
          ) : null}
          {business.website ? (
            <Pressable style={styles.actionBtn} onPress={() => openUrl(business.website!)}>
              <Ionicons name="globe" size={22} color={Colors.primary} />
              <Text style={styles.actionText}>Website</Text>
            </Pressable>
          ) : null}
          {business.address ? (
            <Pressable style={styles.actionBtn} onPress={() => openMaps(business.address!)}>
              <Ionicons name="navigate" size={22} color={Colors.primary} />
              <Text style={styles.actionText}>Directions</Text>
            </Pressable>
          ) : null}
          {business.orderUrl ? (
            <Pressable style={styles.actionBtn} onPress={() => openUrl(business.orderUrl!)}>
              <Ionicons name="cart" size={22} color={Colors.primary} />
              <Text style={styles.actionText}>Order</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={22} color={Colors.primary} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>

        {/* Description */}
        {business.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>
              {business.name ? `About ${business.name}` : 'About'}
            </Text>
            <Text style={styles.descriptionText}>{business.description}</Text>
          </View>
        ) : null}

        {/* Social Links */}
        {(business.facebookUrl || business.instagramUrl || business.yelpUrl || business.googleMapsUrl) ? (
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Find Us</Text>
            <View style={styles.socialRow}>
              {business.facebookUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => openUrl(business.facebookUrl!)}>
                  <Ionicons name="logo-facebook" size={28} color="#1877F2" />
                  <Text style={styles.socialLabel}>Facebook</Text>
                </Pressable>
              ) : null}
              {business.instagramUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => openUrl(business.instagramUrl!)}>
                  <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                  <Text style={styles.socialLabel}>Instagram</Text>
                </Pressable>
              ) : null}
              {business.yelpUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => openUrl(business.yelpUrl!)}>
                  <Ionicons name="star" size={28} color="#D32323" />
                  <Text style={styles.socialLabel}>Yelp</Text>
                </Pressable>
              ) : null}
              {business.googleMapsUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => openUrl(business.googleMapsUrl!)}>
                  <Ionicons name="map" size={28} color="#4285F4" />
                  <Text style={styles.socialLabel}>Maps</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Stats */}
        {business.likeCount > 0 ? (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{business.likeCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.65,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 20,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLarge: {
    width: 100,
    height: 100,
  },
  placeholderLetter: {
    fontSize: 60,
    fontWeight: '700',
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  sectionBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sectionBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  socialSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  socialBtn: {
    alignItems: 'center',
    gap: 4,
  },
  socialLabel: {
    fontSize: 11,
    color: Colors.gray,
  },
  statsSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
