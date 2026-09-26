import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { preferencesStorage } from '@/src/data';

const REMINDER_NOTIFICATION_KEY = 'daily_read_reminder_notification_id';
const REMINDER_CHANNEL_ID = 'daily-reading-reminder';
const REMINDER_HOUR = 20;
const REMINDER_MINUTE = 0;

class NotificationsService {
  private storage = preferencesStorage;

  /** `expo-notifications` is not supported on web, so every entry point bails. */
  private get isSupported(): boolean {
    return Platform.OS !== 'web';
  }

  private getStoredNotificationId(): string | null {
    return this.storage.getString(REMINDER_NOTIFICATION_KEY) ?? null;
  }

  private setStoredNotificationId(identifier: string): void {
    this.storage.set(REMINDER_NOTIFICATION_KEY, identifier);
  }

  private removeStoredNotificationId(): void {
    this.storage.remove(REMINDER_NOTIFICATION_KEY);
  }

  private getNotificationTrigger(): Notifications.CalendarTriggerInput {
    return {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
      repeats: true,
    };
  }

  /**
   * Personalised copy. A streak in progress makes the nudge concrete, which
   * is far more likely to be acted on than a generic "time to read".
   */
  private buildContent(currentStreak: number) {
    const body =
      currentStreak > 0
        ? `Keep your ${currentStreak}-day streak alive. A few pages is enough.`
        : "You haven't read yet today. Start a new streak.";
    return {
      title: 'Time to read',
      body,
      sound: 'default' as const,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'daily-reading-reminder' },
    };
  }

  /**
   * Android 8+ silently drops notifications that have no channel, so this must
   * run before any schedule request.
   */
  async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Reading reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5c2d00',
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported) return false;

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.granted;

    if (!finalStatus) {
      const permissionRequest = await Notifications.requestPermissionsAsync();
      finalStatus = permissionRequest.granted;
    }

    return finalStatus;
  }

  async cancelDailyReadingReminder(): Promise<void> {
    const storedId = this.getStoredNotificationId();
    if (!storedId) {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(storedId);
    } catch (error) {
      console.warn('Failed to cancel scheduled reading reminder:', error);
    } finally {
      this.removeStoredNotificationId();
    }
  }

  async scheduleDailyReadingReminder(
    currentStreak = 0
  ): Promise<string | null> {
    if (!this.isSupported) return null;

    await this.ensureAndroidChannel();
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Replace rather than stack, so repeated calls never leave duplicates.
    await this.cancelDailyReadingReminder();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: this.buildContent(currentStreak),
      trigger: this.getNotificationTrigger(),
    });

    this.setStoredNotificationId(identifier);
    return identifier;
  }

  /**
   * Re-evaluates the daily reminder. Self-heals: a stored id whose
   * notification no longer exists (OS cleared it on reboot/reinstall) is
   * rescheduled rather than trusted, which previously left users with no
   * reminder and no indication anything was wrong.
   */
  async refreshDailyReminder(
    hasReadToday: boolean,
    currentStreak = 0
  ): Promise<void> {
    if (!this.isSupported) return;

    if (hasReadToday) {
      await this.cancelDailyReadingReminder();
      return;
    }

    const storedId = this.getStoredNotificationId();
    if (storedId) {
      try {
        const scheduled =
          await Notifications.getAllScheduledNotificationsAsync();
        const stillScheduled = scheduled.some(
          notification => notification.identifier === storedId
        );
        if (stillScheduled) return;
      } catch (error) {
        console.warn('Failed to verify scheduled reminder:', error);
      }
      this.removeStoredNotificationId();
    }

    await this.scheduleDailyReadingReminder(currentStreak);
  }

  async sendReminderImmediately(currentStreak = 0): Promise<string | null> {
    if (!this.isSupported) return null;

    await this.ensureAndroidChannel();
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: this.buildContent(currentStreak),
      trigger: null,
    });
  }
}

export default NotificationsService;
