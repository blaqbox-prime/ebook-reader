import { Stack } from 'expo-router';
import '../global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fonts } from '@/assets';
import { useEffect } from 'react';
import { ReaderProvider } from '@epubjs-react-native/core';
import * as Notifications from 'expo-notifications';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

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

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, // Show the banner at the top
      shouldShowList: true, // Show in notification tray
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return (
    <GluestackUIProvider mode="dark">
      <ReaderProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(main)" />
          <Stack.Screen name="reader/[uri]" />
        </Stack>
      </ReaderProvider>
    </GluestackUIProvider>
  );
}
