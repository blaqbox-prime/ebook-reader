import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import ReminderTimeField from '@/src/components/ReminderTimeField';
import type { ToastIconName } from '@/src/components/ActionToast';
import { NotificationsService } from '@/src/services';
import { usePreferencesStore, useUserStatsStore } from '@/src/store';

type ReminderSettingsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, icon?: ToastIconName) => void;
};

const notificationsService = new NotificationsService();

const ReminderSettingsSheet = ({
  isOpen,
  onClose,
  onToast,
}: ReminderSettingsSheetProps) => {
  const {
    reminderEnabled,
    reminderHour,
    reminderMinute,
    setReminderEnabled,
    setReminderTime,
  } = usePreferencesStore();
  const currentStreak = useUserStatsStore(state => state.currentStreak);
  const [isSending, setSending] = useState(false);

  // expo-notifications has no web implementation, so the whole sheet is inert
  // there. Saying so is better than offering a switch that does nothing.
  const isSupported = notificationsService.isSupported;

  /**
   * Schedules here rather than leaving it to the root layout's effect so the
   * switch feels instant. Both paths converge on the same idempotent service
   * call, which cancels before it reschedules, so a race between them cannot
   * produce a duplicate reminder.
   */
  const handleToggle = useCallback(
    async (enabled: boolean) => {
      setReminderEnabled(enabled);

      if (!notificationsService.isSupported) return;

      if (enabled) {
        await notificationsService.scheduleDailyReadingReminder(
          currentStreak,
          reminderHour,
          reminderMinute
        );
        onToast('Daily reminder on', 'notifications-active');
        return;
      }

      await notificationsService.cancelDailyReadingReminder();
      onToast('Daily reminder off', 'notifications-off');
    },
    [currentStreak, onToast, reminderHour, reminderMinute, setReminderEnabled]
  );

  const handleSendTest = useCallback(async () => {
    if (isSending) return;
    setSending(true);

    try {
      const identifier = await notificationsService.sendReminderImmediately(
        currentStreak
      );

      if (identifier) {
        onToast('Test reminder sent', 'notifications-active');
        return;
      }

      // The only two reasons it returns null are an unsupported platform and a
      // denied permission, and the sheet is unreachable on the former.
      onToast('Allow notifications to send a test', 'error');
    } finally {
      setSending(false);
    }
  }, [currentStreak, isSending, onToast]);

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose} snapPoints={[58]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator className="bg-m3-outline/40" />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full">
          <View className="flex-row items-center justify-between pb-3">
            <Text className="font-lato-black text-base text-m3-on-surface flex-1">
              Daily reminder
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close reminder settings"
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <MaterialIcons name="close" size={20} color="#52443b" />
            </TouchableOpacity>
          </View>

          <View className="w-full flex-row items-center gap-3 px-4 py-3.5 rounded-xl bg-m3-surface-mid mb-2">
            <View className="w-10 h-10 rounded-xl bg-m3-surface-highest items-center justify-center">
              <MaterialIcons
                name={reminderEnabled ? 'notifications-active' : 'notifications-off'}
                size={20}
                color={reminderEnabled ? '#5c2d00' : '#857469'}
              />
            </View>
            <View className="flex-col flex-1 min-w-0 gap-0.5">
              <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
                Reading nudge
              </Text>
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                {isSupported
                  ? reminderEnabled
                    ? 'On · silent once you hit your daily goal'
                    : 'Off'
                  : 'Reminders are not available on web'}
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={next => void handleToggle(next)}
              disabled={!isSupported}
              accessibilityLabel="Toggle daily reading reminder"
              trackColor={{ false: '#857469', true: '#5c2d00' }}
              thumbColor="#ffffff"
            />
          </View>

          <ReminderTimeField
            hour={reminderHour}
            minute={reminderMinute}
            disabled={!reminderEnabled || !isSupported}
            onChange={(hour, minute) => {
              setReminderTime(hour, minute);
              onToast('Reminder time updated', 'schedule');
            }}
          />

          <TouchableOpacity
            onPress={() => void handleSendTest()}
            disabled={!isSupported || isSending}
            accessibilityRole="button"
            className={`w-full flex-row items-center justify-center gap-2 py-3.5 mt-3 rounded-xl ${
              !isSupported || isSending
                ? 'bg-m3-surface-low'
                : 'bg-m3-surface-mid'
            }`}
          >
            <MaterialIcons
              name="send"
              size={17}
              color={!isSupported || isSending ? '#857469' : '#5c2d00'}
            />
            <Text
              className={`text-[14px] leading-5 font-semibold ${
                !isSupported || isSending
                  ? 'text-m3-outline'
                  : 'text-m3-primary'
              }`}
            >
              {isSending ? 'Sending...' : 'Send a test reminder'}
            </Text>
          </TouchableOpacity>

          <Text className="text-[11px] leading-4 text-m3-on-surface-variant mt-3">
            The nudge adapts to your streak, and switches itself off for the day
            once you have read. Nothing is sent anywhere.
          </Text>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ReminderSettingsSheet;
