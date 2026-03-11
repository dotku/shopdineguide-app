import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsPrivacyScreen() {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL('mailto:privacy@shopdineguide.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>ShopDineGuide | Last Updated: January 28, 2025</Text>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.paragraph}>
          ShopDineGuide ("the App") is a local dining and shopping guide application developed by JYTech LLC. 
          This Privacy Policy explains how we handle information when you use our App.
        </Text>

        <Text style={styles.sectionTitle}>Information We Collect</Text>

        <Text style={styles.subSectionTitle}>Information We Do NOT Collect</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Personal Information:</Text> We do not collect names, email addresses, phone numbers, or any other personally identifiable information.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Location Data:</Text> We do not access your device's GPS or location services. City and neighborhood selections are made manually by you within the App.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Account Information:</Text> The App does not require user registration or login. There are no user accounts.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Analytics or Tracking:</Text> We do not use analytics services, advertising SDKs, or tracking technologies.</Text>
        </View>

        <Text style={styles.subSectionTitle}>Information Stored Locally on Your Device</Text>
        <Text style={styles.paragraph}>
          The App stores the following data locally on your device only:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Bookmarks:</Text> When you bookmark a business, this preference is saved locally on your device using the device's local storage. This data is not transmitted to any server.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>Business Data Cache:</Text> Business listing information is cached locally to improve app performance.</Text>
        </View>

        <Text style={styles.paragraph}>This locally stored data:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Never leaves your device</Text>
          <Text style={styles.bullet}>• Is not accessible to us or any third party</Text>
          <Text style={styles.bullet}>• Can be deleted by uninstalling the App</Text>
        </View>

        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App may display links to external websites (business websites, Google Maps, Yelp, social media pages). 
          These third-party services have their own privacy policies, and we encourage you to review them. 
          We are not responsible for the privacy practices of these external sites.
        </Text>

        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.paragraph}>
          Since we do not collect or transmit personal data, there is no personal information at risk. 
          All user preferences (such as bookmarks) are stored locally on your device.
        </Text>

        <Text style={styles.sectionTitle}>Children's Privacy</Text>
        <Text style={styles.paragraph}>
          The App does not knowingly collect any personal information from children under the age of 13. 
          Since we do not collect personal information from any users, the App is safe for users of all ages.
        </Text>

        <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Any changes will be reflected with an updated 
          "Last Updated" date at the top of this page. We encourage you to review this Privacy Policy periodically.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactBox}>
          <Text style={styles.paragraph}>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>JYTech LLC</Text>{'\n'}
            Email: <Text style={styles.link} onPress={openEmail}>privacy@shopdineguide.com</Text>
          </Text>
        </View>

        <Text style={styles.footer}>
          This privacy policy is effective as of January 28, 2025.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 25,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e8f5e9',
    paddingBottom: 8,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#444',
    marginTop: 15,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#2E7D32',
  },
  contactBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  link: {
    color: '#2E7D32',
    textDecorationLine: 'underline',
  },
  footer: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 30,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});