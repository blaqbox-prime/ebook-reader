import '@/app/global.css';
import { ReaderProvider } from '@epubjs-react-native/core';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';





export default function RootLayout() {

   const [loaded, error] = useFonts({
    // Primary 
    'Lato-Black': require('../assets/fonts/Lato/Lato-Black.ttf'),
    'Lato-Bold': require('../assets/fonts/Lato/Lato-Bold.ttf'),
    'Lato-Light': require('../assets/fonts/Lato/Lato-Light.ttf'),
    'Lato-Regular': require('../assets/fonts/Lato/Lato-Regular.ttf'),
    'Lato-Thin': require('../assets/fonts/Lato/Lato-Thin.ttf'),
    
    // Secondary
    'Lora': require('../assets/fonts/Lora/Lora-VariableFont_wght.ttf'),
  });

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
    <Stack screenOptions={{statusBarHidden: true}}>
    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
    <Stack.Screen name="reader/[uri]" options={{headerShown: false}}/>
  </Stack>
  <StatusBar hidden={true} />
  </ReaderProvider>
  );
}
