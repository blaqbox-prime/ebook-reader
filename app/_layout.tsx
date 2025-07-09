import '@/app/global.css';
import { ReaderProvider } from '@epubjs-react-native/core';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';


export default function RootLayout() {
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
