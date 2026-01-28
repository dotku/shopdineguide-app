import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import type { Business } from '../types/business';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2;

interface Props {
  business: Business;
  width?: number;
  imageHeight?: number;
}

export function BusinessCard({ business, width, imageHeight }: Props) {
  const cardWidth = width || CARD_WIDTH;
  const imgHeight = imageHeight || cardWidth * 0.9;

  return (
    <Pressable
      style={[styles.container, { width: cardWidth }]}
      onPress={() => router.push(`/business/${business.id}`)}
    >
      <View style={[styles.imageContainer, { width: cardWidth, height: imgHeight }]}>
        {business.posterUrl ? (
          <Image
            source={{ uri: business.posterUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : business.logoUrl ? (
          <Image
            source={{ uri: business.logoUrl }}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {business.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        {business.isAd ? (
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
        ) : null}
        {business.logoUrl && business.posterUrl ? (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: business.logoUrl }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {business.name}
        </Text>
        <View style={styles.meta}>
          {business.city ? (
            <Text style={styles.city} numberOfLines={1}>
              {business.neighborhood || business.city}
            </Text>
          ) : null}
          {business.likeCount > 0 ? (
            <Text style={styles.likes}>{business.likeCount.toLocaleString()}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: Colors.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  adBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  city: {
    fontSize: 12,
    color: Colors.gray,
    flex: 1,
  },
  likes: {
    fontSize: 11,
    color: Colors.gray,
    marginLeft: 4,
  },
});
