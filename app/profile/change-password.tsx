import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      const message = 'Please fill in all fields';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = 'New passwords do not match';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    if (newPassword.length < 6) {
      const message = 'New password must be at least 6 characters';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      if (Platform.OS === 'web') {
        alert('Password changed successfully!');
      } else {
        Alert.alert('Success', 'Password changed successfully!');
      }
      router.back();
    } else {
      if (Platform.OS === 'web') {
        alert(result.error || 'Password change failed');
      } else {
        Alert.alert('Error', result.error || 'Password change failed');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Changing...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  form: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});