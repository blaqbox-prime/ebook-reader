import '@/app/global.css';
import { fonts } from '@/assets';
import { startLibrarySync } from "@/zustand/libraryStore";
import { ReaderProvider } from '@epubjs-react-native/core';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export default function RootLayout() {

   const [loaded, error] = useFonts(fonts);

  useEffect(() => {

    startLibrarySync()

    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
  
    <GluestackUIProvider mode="dark">
      <ReaderProvider>
    <Stack screenOptions={{statusBarHidden: true}}>
    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
    <Stack.Screen name="reader/[uri]" options={{headerShown: false}}/>

  </Stack>
  </ReaderProvider>
    </GluestackUIProvider>
  
  );
}
