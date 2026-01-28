import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { database } from '@/src/services/database';
import { useAppStore } from '@/src/hooks/useAppStore';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const setDbReady = useAppStore((s) => s.setDbReady);

  useEffect(() => {
    async function init() {
      try {
        await database.getDb();

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
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="business/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="search"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
