import { Stack, router } from 'expo-router';
import '../global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fonts } from '@/assets';
import { useEffect } from 'react';
import { ReaderProvider } from '@epubjs-react-native/core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import {
  useOnboardingStore,
  usePreferencesStore,
  useUserStatsStore,
} from '@/src/store';
import { NotificationsService, SessionTrackingService } from '@/src/services';

const notificationsService = new NotificationsService();
const sessionTrackingService = new SessionTrackingService();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show the banner at the top
    shouldShowList: true, // Show in notification tray
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts(fonts);
  const hasCompletedOnboarding = useOnboardingStore(
    state => state.hasCompletedOnboarding
  );
  const currentStreak = useUserStatsStore(state => state.currentStreak);
  const todayMinutesRead = useUserStatsStore(state => state.todayMinutesRead);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Notification channel must exist before scheduling; on Android a missing
  // channel means the reminder is silently dropped.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void notificationsService.ensureAndroidChannel();
  }, []);

  // Tapping a reminder should land somewhere useful. Registered once at the
  // root so it is live whether the app is already open or cold-started from
  // the notification.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const openFromNotification = (
      response: Notifications.NotificationResponse | null
    ) => {
      const data = response?.notification.request.content.data;
      if (data?.type === 'daily-reading-reminder') {
        router.push('/(main)');
      }
    };

    void Notifications.getLastNotificationResponseAsync().then(
      openFromNotification
    );

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        openFromNotification
      );

    return () => subscription.remove();
  }, []);

  // Repair sessions left open by a crash or force-quit, otherwise that reading
  // time is lost and the streak/XP are under-counted.
  useEffect(() => {
    void sessionTrackingService.recoverUnclosedSessions();
  }, []);

  // Keep the daily reminder honest: cancelled once the goal is met, cancelled
  // outright when the preference is off, and rescheduled if the OS dropped it
  // or the user picked a different time.
  const reminderEnabled = usePreferencesStore(state => state.reminderEnabled);
  const reminderHour = usePreferencesStore(state => state.reminderHour);
  const reminderMinute = usePreferencesStore(state => state.reminderMinute);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    void notificationsService.refreshDailyReminder(
      todayMinutesRead > 0,
      currentStreak,
      reminderEnabled,
      reminderHour,
      reminderMinute
    );
  }, [
    hasCompletedOnboarding,
    todayMinutesRead,
    currentStreak,
    reminderEnabled,
    reminderHour,
    reminderMinute,
  ]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GluestackUIProvider mode="dark">
      <ReaderProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={hasCompletedOnboarding ? '(main)' : 'onboarding'}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Protected guard={hasCompletedOnboarding}>
            <Stack.Screen name="(main)" />
            <Stack.Screen name="reader/[uri]" />
          </Stack.Protected>
        </Stack>
      </ReaderProvider>
    </GluestackUIProvider>
  );
}
