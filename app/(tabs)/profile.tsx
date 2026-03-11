import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';


export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        setLoading(true);
        await logout();
        router.replace('/(auth)/login');
        setLoading(false);
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              await logout();
              setLoading(false);
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="person-circle" size={80} color="#007AFF" />
          )}
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.name && <Text style={styles.name}>{user.name}</Text>}
        {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
        <Text style={styles.userId}>User ID: {user?.id}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/change-password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Content</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/bookmarks')}
        >
          <Ionicons name="bookmark-outline" size={24} color="#333" />
          <Text style={styles.menuText}>My Bookmarks</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/support/help')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/support/about')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/legal/terms-privacy')}
        >
          <Ionicons name="document-text-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>
          {loading ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  email: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  phone: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 30,
  },
});