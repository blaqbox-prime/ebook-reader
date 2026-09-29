import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import NotificationsService from '@/src/services/NotificationsService';

const scheduled = Notifications.scheduleNotificationAsync as jest.Mock;
const cancelled = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const presented = Notifications.getPresentedNotificationsAsync as jest.Mock;
const allScheduled =
  Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const dismiss = Notifications.dismissNotificationAsync as jest.Mock;

const setOS = (os: 'ios' | 'android' | 'web') => {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
};

/**
 * `clearMocks` wipes call history but keeps implementations, so a
 * `mockResolvedValue` set in one test would otherwise leak into the next. Every
 * default is re-stated per test to keep them independent.
 */
const resetNotificationMocks = () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
    granted: true,
  });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
    granted: true,
  });
  scheduled.mockResolvedValue('id-1');
  cancelled.mockResolvedValue(true);
  presented.mockResolvedValue([]);
  allScheduled.mockResolvedValue([]);
  dismiss.mockResolvedValue(true);
  (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(
    'channel'
  );
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    preferencesStorage.clearAll();
    resetNotificationMocks();
    service = new NotificationsService();
    setOS('ios');
  });

  describe('isSupported', () => {
    it('is true on iOS and Android', () => {
      setOS('ios');
      expect(service.isSupported).toBe(true);
      setOS('android');
      expect(service.isSupported).toBe(true);
    });

    it('is false on web', () => {
      setOS('web');
      expect(service.isSupported).toBe(false);
    });
  });

  describe('scheduleDailyReadingReminder', () => {
    it('defaults to the 8pm slot', async () => {
      await service.scheduleDailyReadingReminder(0);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            hour: 20,
            minute: 0,
            repeats: true,
          }),
        })
      );
    });

    it('honours a custom hour and minute', async () => {
      await service.scheduleDailyReadingReminder(0, 6, 45);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ hour: 6, minute: 45 }),
        })
      );
    });

    it('tags the payload so only our reminder is dismissed later', async () => {
      await service.scheduleDailyReadingReminder(3);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: { type: 'daily-reading-reminder' },
          }),
        })
      );
    });

    it('personalises the body for an active streak', async () => {
      await service.scheduleDailyReadingReminder(5);
      const [{ content }] = scheduled.mock.calls[0];
      expect(content.body).toContain('5-day streak');

      scheduled.mockClear();
      await service.scheduleDailyReadingReminder(0);
      const [{ content: noStreak }] = scheduled.mock.calls[0];
      expect(noStreak.body).toContain("haven't read yet");
    });

    it('creates the Android channel before scheduling', async () => {
      setOS('android');
      await service.scheduleDailyReadingReminder(0);

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'daily-reading-reminder',
        expect.objectContaining({ name: 'Reading reminders' })
      );
    });

    it('does not create a channel on iOS', async () => {
      await service.scheduleDailyReadingReminder(0);

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });

    it('returns null and schedules nothing when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      const result = await service.scheduleDailyReadingReminder(0);

      expect(result).toBeNull();
      expect(scheduled).not.toHaveBeenCalled();
    });

    it('returns null and does nothing on web', async () => {
      setOS('web');

      const result = await service.scheduleDailyReadingReminder(0);

      expect(result).toBeNull();
      expect(scheduled).not.toHaveBeenCalled();
    });

    it('replaces rather than stacks, so repeated calls leave one trigger', async () => {
      await service.scheduleDailyReadingReminder(0);
      preferencesStorage.set('daily_read_reminder_notification_id', 'old-id');

      await service.scheduleDailyReadingReminder(0);

      expect(cancelled).toHaveBeenCalledWith('old-id');
    });
  });

  describe('cancelDailyReadingReminder', () => {
    it('is a no-op when nothing is stored', async () => {
      await service.cancelDailyReadingReminder();

      expect(cancelled).not.toHaveBeenCalled();
    });

    it('clears the stored id even if cancellation throws', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'id-1');
      cancelled.mockRejectedValueOnce(new Error('OS refused'));

      await service.cancelDailyReadingReminder();

      expect(
        preferencesStorage.getString('daily_read_reminder_notification_id')
      ).toBeUndefined();
    });

    it('dismisses only our own delivered reminders', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'id-1');
      presented.mockResolvedValue([
        {
          request: {
            identifier: 'ours-1',
            content: { data: { type: 'daily-reading-reminder' } },
          },
        },
        {
          request: {
            identifier: 'someone-else',
            content: { data: { type: 'other' } },
          },
        },
      ]);

      await service.cancelDailyReadingReminder();

      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('ours-1');
    });

    it('still cancels when the dismiss step fails', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'id-1');
      presented.mockRejectedValue(new Error('no tray'));

      await expect(
        service.cancelDailyReadingReminder()
      ).resolves.toBeUndefined();
      expect(cancelled).toHaveBeenCalledWith('id-1');
    });
  });

  describe('refreshDailyReminder', () => {
    it('cancels and schedules nothing when disabled', async () => {
      await service.refreshDailyReminder(false, 0, false, 20, 0);

      expect(scheduled).not.toHaveBeenCalled();
    });

    it('cancels once the user has already met the goal today', async () => {
      await service.refreshDailyReminder(true, 0, true, 20, 0);

      expect(scheduled).not.toHaveBeenCalled();
      expect(cancelled).not.toHaveBeenCalled();
    });

    it('schedules when enabled and the goal is unmet', async () => {
      await service.refreshDailyReminder(false, 2, true, 9, 30);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ hour: 9, minute: 30 }),
        })
      );
    });

    it('leaves an already-correct schedule alone', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'id-1');
      allScheduled.mockResolvedValue([
        { identifier: 'id-1', trigger: { hour: 20, minute: 0 } },
      ]);

      await service.refreshDailyReminder(false, 0, true, 20, 0);

      expect(scheduled).not.toHaveBeenCalled();
      expect(cancelled).not.toHaveBeenCalled();
    });

    it('re-arms with the new time when the schedule no longer matches', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'id-1');
      allScheduled.mockResolvedValue([
        { identifier: 'id-1', trigger: { hour: 20, minute: 0 } },
      ]);

      await service.refreshDailyReminder(false, 0, true, 7, 15);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ hour: 7, minute: 15 }),
        })
      );
    });

    it('self-heals when the stored id no longer exists', async () => {
      preferencesStorage.set('daily_read_reminder_notification_id', 'gone');
      allScheduled.mockResolvedValue([]);

      await service.refreshDailyReminder(false, 0, true, 20, 0);

      expect(scheduled).toHaveBeenCalledTimes(1);
    });

    it('does nothing on web', async () => {
      setOS('web');

      await service.refreshDailyReminder(false, 0, true, 20, 0);

      expect(scheduled).not.toHaveBeenCalled();
    });
  });

  describe('sendReminderImmediately', () => {
    it('sends with a null trigger so it fires at once', async () => {
      const id = await service.sendReminderImmediately(2);

      expect(id).toBe('id-1');
      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({ trigger: null })
      );
    });

    it('is tagged as a reminder', async () => {
      await service.sendReminderImmediately(0);

      expect(scheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: { type: 'daily-reading-reminder' },
          }),
        })
      );
    });

    it('returns null when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      expect(await service.sendReminderImmediately(0)).toBeNull();
      expect(scheduled).not.toHaveBeenCalled();
    });

    it('does not clobber the stored schedule id', async () => {
      await service.scheduleDailyReadingReminder(0);
      preferencesStorage.set('daily_read_reminder_notification_id', 'keep-me');

      await service.sendReminderImmediately(0);

      expect(
        preferencesStorage.getString('daily_read_reminder_notification_id')
      ).toBe('keep-me');
    });
  });

  describe('requestPermissions', () => {
    it('reuses an existing grant without prompting', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });

      expect(await service.requestPermissions()).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('prompts when not yet granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });

      expect(await service.requestPermissions()).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false on web without touching the native module', async () => {
      setOS('web');

      expect(await service.requestPermissions()).toBe(false);
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // BUG-37: when the reminder time changes, refreshDailyReminder detects the
  // mismatch and calls removeStoredNotificationId() *before* delegating to
  // scheduleDailyReadingReminder. That method's own cancel step reads the
  // (now empty) stored id and returns early, so the previously scheduled OS
  // notification is never cancelled - only forgotten. The user is left with
  // two daily calendar triggers: the old time and the new one.
  // ---------------------------------------------------------------------
  describe('BUG-37: changing the reminder time leaves a duplicate schedule', () => {
    it.todo(
      'cancels the previously scheduled OS notification when the time changes'
    );

    it.todo('leaves exactly one pending daily trigger after a time change');
  });
});
