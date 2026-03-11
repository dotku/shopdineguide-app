import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const router = useRouter();

  const openEmail = (subject: string) => {
    const email = 'support@shopdineguide.com';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailto);
  };

  const openWebsite = () => {
    Linking.openURL('https://shopdineguide.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openEmail('General Inquiry')}
          >
            <Ionicons name="mail-outline" size={24} color="#007AFF" />
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDetail}>support@shopdineguide.com</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={openWebsite}
          >
            <Ionicons name="globe-outline" size={24} color="#007AFF" />
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Visit Website</Text>
              <Text style={styles.contactDetail}>shopdineguide.com</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openEmail('Report a Problem')}
          >
            <Ionicons name="flag-outline" size={24} color="#007AFF" />
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Report a Problem</Text>
              <Text style={styles.contactDetail}>Let us know if something's wrong</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openEmail('Feature Request')}
          >
            <Ionicons name="bulb-outline" size={24} color="#007AFF" />
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Request a Feature</Text>
              <Text style={styles.contactDetail}>Share your ideas with us</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEmail('Account Help')}
          >
            <Ionicons name="person-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Account Issues</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => openEmail('Business Listing Request')}
          >
            <Ionicons name="business-outline" size={20} color="#007AFF" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              List Your Business
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactContent: {
    flex: 1,
    marginLeft: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    color: '#007AFF',
  },
  bottomPadding: {
    height: 40,
  },
});