import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@/src/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';
import NotificationsService from '@/src/services/NotificationsService';
import * as Notifications from 'expo-notifications';

const StreakSummary = () => {
  const { currentStreak } = useUserStatsStore();
  const [status, setStatus] = useState<string>('Idle');

  // Test notification service by triggering a notification now
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Listen for incoming notifications while app is open
    listenerRef.current = Notifications.addNotificationReceivedListener(
      notification => {
        const title =
          notification.request.content.title ?? 'Testin notification';
        const body =
          notification.request.content.body ??
          'This is a test notification body.';
      }
    );

    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  const handleTestNotification = async () => {
    const notificationsService = new NotificationsService();
    setStatus('Sending...');
    try {
      const id = await notificationsService.sendReminderImmediately();
      if (id) {
        setStatus(`✅ Sent! ID: ${id.slice(0, 8)}...`);
      } else {
        setStatus('❌ Permission denied');
      }
    } catch (e) {
      setStatus(`❌ Error: ${String(e)}`);
    }
  };

  return (
    <View className="bg-app-deep-mocha-300 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <TouchableOpacity
        className="absolute -top-5 -right-5 opacity-25"
        onPress={handleTestNotification}
      >
        <MaterialIcons
          name="local-fire-department"
          size={80}
          color={colors['khaki-beige'][800]}
        />
      </TouchableOpacity>
      <Text className="text-white text-5xl font-heading">{currentStreak}</Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Daily Streak
      </Text>
    </View>
  );
};

export default StreakSummary;
