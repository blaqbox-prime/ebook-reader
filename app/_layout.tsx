import '@/app/global.css';
import { fonts } from '@/assets';
import { ReaderProvider } from '@epubjs-react-native/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function RootLayout() {

   const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
       async function checkStorage() {
        const keys = await AsyncStorage.getAllKeys();
        keys.forEach(async (key) => {
          if(!await AsyncStorage.getItem(key)){
            await AsyncStorage.setItem(key, "NO ITEM FOUND HERE")
          }
          const item = await AsyncStorage.getItem(key);
          console.log(key, ":", item + "\n");
        });
        console.log(keys);
      }

      checkStorage()
      
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
