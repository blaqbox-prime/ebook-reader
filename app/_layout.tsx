import { Stack } from 'expo-router';
import '../global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fonts } from '@/assets';
import { useEffect } from 'react';
import { ReaderProvider } from '@epubjs-react-native/core';

export default function RootLayout() {
  const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ReaderProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ReaderProvider>
  );
}
