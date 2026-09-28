import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { preferencesStorage } from '@/src/data';

const REMINDER_NOTIFICATION_KEY = 'daily_read_reminder_notification_id';
const REMINDER_CHANNEL_ID = 'daily-reading-reminder';

/** Fallbacks matching the shipped 8pm reminder, used when a caller omits a time. */
const DEFAULT_REMINDER_HOUR = 20;
const DEFAULT_REMINDER_MINUTE = 0;

class NotificationsService {
  private storage = preferencesStorage;

  /**
   * `expo-notifications` is not supported on web, so every entry point bails.
   * Public because the UI needs it to hide reminder controls rather than offer
   * a setting that silently does nothing.
   */
  get isSupported(): boolean {
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

  private getNotificationTrigger(
    hour: number,
    minute: number
  ): Notifications.CalendarTriggerInput {
    return {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
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

  /**
   * Clears an already-delivered reminder from the tray.
   *
   * Cancelling a schedule only stops future deliveries, so without this a
   * reminder the user has since turned off keeps sitting in the tray looking
   * pending. Scoped to our own reminder type rather than using
   * `dismissAllNotificationsAsync`, so a future notification kind is not
   * collateral damage.
   */
  private async dismissDeliveredReminders(): Promise<void> {
    try {
      const presented = await Notifications.getPresentedNotificationsAsync();
      const ours = presented.filter(
        item => item.request.content.data?.type === 'daily-reading-reminder'
      );
      await Promise.all(
        ours.map(item =>
          Notifications.dismissNotificationAsync(item.request.identifier)
        )
      );
    } catch (error) {
      // Nothing scheduled means nothing to dismiss, and a failure here must
      // never block cancelling the schedule itself.
      console.warn('Failed to dismiss delivered reading reminder:', error);
    }
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
      await this.dismissDeliveredReminders();
    }
  }

  async scheduleDailyReadingReminder(
    currentStreak = 0,
    hour = DEFAULT_REMINDER_HOUR,
    minute = DEFAULT_REMINDER_MINUTE
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
      trigger: this.getNotificationTrigger(hour, minute),
    });

    this.setStoredNotificationId(identifier);
    return identifier;
  }

  /**
   * Reads the hour/minute back off a scheduled notification's trigger.
   *
   * `NotificationTrigger` is a union that includes a catch-all
   * `UnknownNotificationTrigger`, so it cannot be narrowed exhaustively. A
   * structural read is the honest option here: the only trigger this service
   * ever creates is a calendar trigger, and the fields are read-only.
   */
  private static getTriggerTime(
    trigger: Notifications.NotificationTrigger
  ): { hour?: number; minute?: number } | null {
    const candidate = trigger as { hour?: number; minute?: number };
    return typeof candidate.hour === 'number' && typeof candidate.minute === 'number'
      ? candidate
      : null;
  }

  /**
   * Re-evaluates the daily reminder. Self-heals: a stored id whose
   * notification no longer exists (OS cleared it on reboot/reinstall) is
   * rescheduled rather than trusted, which previously left users with no
   * reminder and no indication anything was wrong.
   *
   * Also re-arms when the chosen time no longer matches what the OS holds,
   * because editing the preference is otherwise invisible until reinstall.
   */
  async refreshDailyReminder(
    hasReadToday: boolean,
    currentStreak = 0,
    isEnabled = true,
    hour = DEFAULT_REMINDER_HOUR,
    minute = DEFAULT_REMINDER_MINUTE
  ): Promise<void> {
    if (!this.isSupported) return;

    if (!isEnabled || hasReadToday) {
      await this.cancelDailyReadingReminder();
      return;
    }

    const storedId = this.getStoredNotificationId();
    if (storedId) {
      try {
        const scheduled =
          await Notifications.getAllScheduledNotificationsAsync();
        const match = scheduled.find(
          notification => notification.identifier === storedId
        );

        if (match) {
          const triggerTime = NotificationsService.getTriggerTime(match.trigger);
          if (triggerTime?.hour === hour && triggerTime.minute === minute) {
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to verify scheduled reminder:', error);
      }
      this.removeStoredNotificationId();
    }

    await this.scheduleDailyReadingReminder(currentStreak, hour, minute);
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
