import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatReminderTime } from '@/src/utils/readerFlow';

type ReminderTimeFieldProps = {
  hour: number;
  minute: number;
  disabled?: boolean;
  onChange: (hour: number, minute: number) => void;
};

/**
 * Builds a Date the picker accepts. The picker only reports hours and minutes,
 * so the date half is arbitrary; anchoring it to today avoids any date-based
 * clamping the control might otherwise apply.
 */
const toPickerValue = (hour: number, minute: number): Date => {
  const value = new Date();
  value.setHours(hour, minute, 0, 0);
  return value;
};

/**
 * Reminder time control for iOS and Android.
 *
 * Deliberately native-only. `@react-native-community/datetimepicker` ships no
 * web implementation, so importing it from a shared module would break the web
 * bundle. The web build gets `ReminderTimeField.web.tsx` instead, which Metro
 * resolves in its place.
 */
const ReminderTimeField = ({
  hour,
  minute,
  disabled = false,
  onChange,
}: ReminderTimeFieldProps) => {
  // Android's picker is a modal dialog that appears as soon as it renders, so
  // it has to be mounted on demand rather than shown inline the way iOS does.
  const [isPickerOpen, setPickerOpen] = useState(false);

  const handleChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ): void => {
    // Android dismisses with no date; iOS fires this on every tick.
    if (Platform.OS === 'android') {
      setPickerOpen(false);
    }

    if (event.type === 'dismissed' || !selected) {
      return;
    }

    onChange(selected.getHours(), selected.getMinutes());
  };

  return (
    <View className="flex-col">
      <TouchableOpacity
        onPress={() => setPickerOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Choose reminder time"
        className={`w-full flex-row items-center gap-3 px-4 py-3.5 rounded-xl ${
          disabled ? 'bg-m3-surface-low' : 'bg-m3-surface-mid'
        }`}
      >
        <View className="w-10 h-10 rounded-xl bg-m3-surface-highest items-center justify-center">
          <MaterialIcons
            name="schedule"
            size={20}
            color={disabled ? '#857469' : '#5c2d00'}
          />
        </View>
        <View className="flex-col flex-1 min-w-0 gap-0.5">
          <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
            Reminder time
          </Text>
          <Text
            className={`text-[11px] leading-4 ${
              disabled ? 'text-m3-outline' : 'text-m3-on-surface-variant'
            }`}
          >
            {disabled
              ? 'Turn the reminder on to set a time'
              : `Every day at ${formatReminderTime(hour, minute)}`}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#857469" />
      </TouchableOpacity>

      {isPickerOpen ? (
        <DateTimePicker
          value={toPickerValue(hour, minute)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          // A 60-row minute wheel is miserable to scroll, and a reminder does
          // not need single-minute precision.
          minuteInterval={5}
          // The app already commits to a single light palette, so the picker is
          // pinned to it rather than following the system appearance and
          // clashing with the sheet.
          themeVariant="light"
          textColor="#52443b"
          positiveButton={{ textColor: '#5c2d00' }}
        />
      ) : null}
    </View>
  );
};

export default ReminderTimeField;
