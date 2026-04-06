import * as Notifications from 'expo-notifications';
import { preferencesStorage } from '@/src/data';

const REMINDER_NOTIFICATION_KEY = 'daily_read_reminder_notification_id';

class NotificationsService {
  private storage = preferencesStorage;

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
      hour: 20,
      minute: 0,
      repeats: true,
    };
  }

  async requestPermissions(): Promise<boolean> {
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

  async scheduleDailyReadingReminder(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    await this.cancelDailyReadingReminder();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to read',
        body: "You haven't read yet today. Open the app and continue your streak.",
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily-reading-reminder' },
      },
      trigger: this.getNotificationTrigger(),
    });

    this.setStoredNotificationId(identifier);
    return identifier;
  }

  async refreshDailyReminder(hasReadToday: boolean): Promise<void> {
    if (hasReadToday) {
      await this.cancelDailyReadingReminder();
      await this.scheduleDailyReadingReminder();
      return;
    }

    const storedId = this.getStoredNotificationId();
    if (!storedId) {
      await this.scheduleDailyReadingReminder();
    }
  }

  async sendReminderImmediately(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to read',
        body: "You haven't read yet today. Keep your streak going!",
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily-reading-reminder' },
      },
      trigger: null,
    });
  }
}

export default NotificationsService;
