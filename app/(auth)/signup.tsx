import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignup = async () => {
    // 去除首尾空格
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    // 检查空字段
    if (!trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    // 检查密码长度
    if (trimmedPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    // 检查密码匹配
    if (trimmedPassword !== trimmedConfirm) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await register(trimmedEmail, trimmedPassword);
      
      if (!result.success) {
        showAlert('Signup Failed', result.error || 'Registration failed');
      }
      // 成功后会自动登录并跳转
    } catch (error) {
      console.error('Signup error:', error);
      showAlert('Signup Failed', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});