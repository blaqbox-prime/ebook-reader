import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatReminderTime } from '@/src/utils/readerFlow';

type ReminderTimeFieldProps = {
  hour: number;
  minute: number;
  disabled?: boolean;
  onChange: (hour: number, minute: number) => void;
};

/**
 * `@react-native-community/datetimepicker` has no web implementation, so the
 * web build gets a fixed set of sensible slots instead of a real dial. Metro
 * resolves this file in place of `ReminderTimeField.tsx` for `platform=web`,
 * which is what keeps the native module out of the web bundle.
 */
const REMINDER_TIME_OPTIONS: { hour: number; minute: number }[] = [
  { hour: 7, minute: 0 },
  { hour: 8, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 17, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 19, minute: 0 },
  { hour: 20, minute: 0 },
  { hour: 21, minute: 0 },
  { hour: 22, minute: 0 },
];

const ReminderTimeField = ({
  hour,
  minute,
  disabled = false,
  onChange,
}: ReminderTimeFieldProps) => {
  // A time the user set on a device they no longer use still has to show up as
  // the current value rather than silently snapping back to a preset.
  const matchesPreset = REMINDER_TIME_OPTIONS.some(
    option => option.hour === hour && option.minute === minute
  );

  return (
    <View className="flex-col gap-2">
      <View className="flex-row items-center gap-3 px-4">
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
          <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
            {disabled
              ? 'Turn the reminder on to set a time'
              : `Every day at ${formatReminderTime(hour, minute)}`}
          </Text>
        </View>
      </View>

      {disabled ? null : (
        <View className="flex-row flex-wrap gap-2">
          {REMINDER_TIME_OPTIONS.map(option => {
            const active = option.hour === hour && option.minute === minute;
            return (
              <TouchableOpacity
                key={`${option.hour}:${option.minute}`}
                onPress={() => onChange(option.hour, option.minute)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`rounded-xl px-3 py-2 ${
                  active ? 'bg-m3-primary' : 'bg-m3-surface-mid'
                }`}
              >
                <Text
                  className={`text-[13px] leading-5 font-semibold ${
                    active ? 'text-white' : 'text-m3-on-surface'
                  }`}
                >
                  {formatReminderTime(option.hour, option.minute)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!disabled && !matchesPreset ? (
        <Text className="px-4 text-[11px] leading-4 text-m3-outline">
          Custom time set elsewhere. Pick a slot to change it.
        </Text>
      ) : null}
    </View>
  );
};

export default ReminderTimeField;
