import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { database } from '@/src/services/database';
import { useAppStore } from '@/src/hooks/useAppStore';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('--- RootLayoutNav useEffect ---');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Segments:', segments);
    
    if (loading) {
      console.log('Still loading, returning...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('In auth group:', inAuthGroup);

    if (!user && !inAuthGroup) {
      console.log('🔴 No user - redirecting to login');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } else if (user && inAuthGroup) {
      console.log('🟢 User exists - redirecting to tabs');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } else {
      console.log('⚪ No redirect needed');
    }
  }, [user, loading, segments, router]);

  if (loading) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="business/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="search"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/change-password"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/bookmarks"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="support/help"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="support/about"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="legal/terms-privacy"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const setDbReady = useAppStore((s) => s.setDbReady);

  useEffect(() => {
    async function init() {
      try {
        await database.getDb();

        // await database.cleanupDuplicateBookmarks();

        const seedData = require('@/assets/data/businesses.json');
        const count = await database.seedFromBundle(seedData);
        console.log(`Database: ${count} businesses`);

        setDbReady(true);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  if (!isReady) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}