import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '@/src/services/database';

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      console.log('Checking saved user:', userJson);
      
      if (userJson) {
        const savedUser = JSON.parse(userJson);
        
        if (savedUser && savedUser.id && savedUser.email) {
          const dbUser = await database.getUserByEmail(savedUser.email);
          
          if (dbUser) {
            console.log('Valid user found:', savedUser.email);
            const fullUser = {
              id: dbUser.id,
              email: dbUser.email,
              name: (dbUser as any).name,
              phone: (dbUser as any).phone,
              avatar: (dbUser as any).avatar,
            };
            setUser(fullUser);
            await AsyncStorage.setItem('user', JSON.stringify(fullUser));
          } else {
            console.log('User not found in database, clearing cache');
            await AsyncStorage.removeItem('user');
          }
        } else {
          console.log('Invalid user data, clearing cache');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Check user error:', error);
      await AsyncStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('AuthContext: login called with', email); 
    try {
      const result = await database.loginUser(email, password);
      console.log('AuthContext: login result', result); 
      
      if (result.success && result.user) {
        setUser(result.user);
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('AuthContext: login error', error); 
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string) => {
    console.log('AuthContext: register called with', email);
    try {
      const result = await database.registerUser(email, password);
      console.log('AuthContext: register result', result);
      
      if (result.success) {
        const loginResult = await database.loginUser(email, password);
        console.log('AuthContext: auto-login result', loginResult);
        
        if (loginResult.success && loginResult.user) {
          setUser(loginResult.user);
          await AsyncStorage.setItem('user', JSON.stringify(loginResult.user));
        }
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('AuthContext: register error', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      const result = await database.updateUserProfile(user.id, data);
      
      if (result.success && result.user) {
        const updatedUser = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          phone: result.user.phone,
          avatar: result.user.avatar,
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      const result = await database.changePassword(user.id, oldPassword, newPassword);
      return result;
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  const logout = async () => {
    console.log('=== LOGOUT CALLED ===');
    console.log('Current user before logout:', user);
    setUser(null);
    console.log('User set to null');
    await AsyncStorage.removeItem('user');
    console.log('AsyncStorage cleared');
    console.log('=== LOGOUT COMPLETED ===');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};