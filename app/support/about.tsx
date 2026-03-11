import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function AboutScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoSection}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="storefront" size={60} color="#007AFF" />
          </View>
          <Text style={styles.appName}>ShopDineGuide</Text>
          <Text style={styles.tagline}>Your Local Business Companion</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            ShopDineGuide is your comprehensive guide to local shopping, dining, and entertainment. 
            Discover amazing businesses in your neighborhood, save your favorites, and never miss 
            out on great deals and offers.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Search businesses by location and category</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bookmark" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Save your favorite places</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="pricetag" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Exclusive deals and offers</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="map" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Explore your neighborhood</Text>
            </View>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company</Text>
          <Text style={styles.companyName}>JYTech LLC</Text>
          <Text style={styles.companyDescription}>
            Dedicated to connecting communities with local businesses through innovative technology.
          </Text>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://facebook.com/shopdineguide')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://instagram.com/shopdineguide')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 JYTech LLC. All rights reserved.
        </Text>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  featureList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  companyDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },
  socialButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  socialText: {
    fontSize: 13,
    color: '#666',
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalLinkText: {
    fontSize: 16,
    color: '#333',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
});