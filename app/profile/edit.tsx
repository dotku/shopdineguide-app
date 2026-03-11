import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      const message = 'Sorry, we need camera roll permissions to upload photos.';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Permission Required', message);
      return;
    }

    // 选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // 请求相机权限
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      const message = 'Sorry, we need camera permissions to take photos.';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Permission Required', message);
      return;
    }

    // 拍照
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      // Web 只支持选择图片
      pickImage();
    } else {
      // 移动端显示选项
      Alert.alert(
        'Change Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const result = await updateProfile({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      avatar: avatar || undefined,
    });
    
    setLoading(false);
    
    if (result.success) {
      if (Platform.OS === 'web') {
        alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }
      router.back();
    } else {
      if (Platform.OS === 'web') {
        alert(result.error || 'Update failed');
      } else {
        Alert.alert('Error', result.error || 'Update failed');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={showImageOptions} style={styles.avatarTouchable}>
          {avatar ? (
            <Image 
              source={{ uri: avatar }} 
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle" size={100} color="#007AFF" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeAvatarButton} onPress={showImageOptions}>
          <Text style={styles.changeAvatarText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />
          <Text style={styles.hint}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
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
  avatarSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  changeAvatarText: {
    color: '#007AFF',
    fontSize: 16,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
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