import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { database } from '@/src/services/database';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) {
      const message = 'Please enter your email';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const message = 'Please enter a valid email address';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    setLoading(true);
    const result = await database.createPasswordResetToken(email.trim());
    setLoading(false);

    if (result.success && result.token) {
      setGeneratedToken(result.token);
      
      // 在实际应用中，这里应该发送邮件
      // 现在只是显示验证码（开发环境）
      const message = `Verification code: ${result.token}\n\nIn production, this would be sent to your email.`;
      
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Verification Code Sent', message);
      }
      
      setStep('verify');
    } else {
      const message = result.error || 'Failed to send verification code';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      const message = 'Please enter the verification code';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    setLoading(true);
    const result = await database.verifyPasswordResetToken(email.trim(), code.trim());
    setLoading(false);

    if (result.success) {
      setStep('reset');
    } else {
      const message = result.error || 'Invalid or expired code';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      const message = 'Please fill in all fields';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = 'Passwords do not match';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    if (newPassword.length < 6) {
      const message = 'Password must be at least 6 characters';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
      return;
    }

    setLoading(true);
    const result = await database.resetPassword(email.trim(), code.trim(), newPassword);
    setLoading(false);

    if (result.success) {
      if (Platform.OS === 'web') {
        alert('Password reset successfully! You can now login with your new password.');
        router.replace('/(auth)/login');
      } else {
        Alert.alert(
          'Success',
          'Password reset successfully! You can now login with your new password.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } else {
      const message = result.error || 'Password reset failed';
      Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {step === 'email' && (
        <>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a verification code to reset your password.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleSendCode}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'verify' && (
        <>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {email}. Please enter it below.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoCorrect={false}
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSendCode}
            style={styles.linkButton}
            disabled={loading}
          >
            <Text style={styles.linkText}>Resend Code</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'reset' && (
        <>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Password (min 6 characters)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Back to Login</Text>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
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
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});