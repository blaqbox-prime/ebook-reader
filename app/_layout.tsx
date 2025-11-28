import '@/app/global.css';
import { fonts } from '@/assets';
import { fetchBooks } from '@/lib/storageUtils';
import { ReaderProvider } from '@epubjs-react-native/core';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function RootLayout() {

   const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      console.log(fetchBooks())
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
  <ReaderProvider>
    <Stack screenOptions={{statusBarHidden: true}}>
    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
    <Stack.Screen name="reader/[uri]" options={{headerShown: false}}/>
  </Stack>
  </ReaderProvider>
  );
}
