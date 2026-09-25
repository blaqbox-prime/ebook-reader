import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ReadingSession from '@/src/Models/ReadingSession';
import { formatDuration } from '@/src/utils/bookDetailsUtils';
import { formatSessionTime } from '@/src/utils';
import { Text, TouchableOpacity, View } from 'react-native';

type SessionRowProps = {
  session: ReadingSession;
  bookTitle: string;
  sequenceId: number;
  onPress?: () => void;
};

const SessionRow = ({
  session,
  bookTitle,
  sequenceId,
  onPress,
}: SessionRowProps) => {
  const timeLabel = formatSessionTime(session.timeStart);
  const durationLabel = formatDuration(session.durationInMinutes);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center gap-3 py-3"
    >
      <View className="w-10 h-10 rounded-xl bg-m3-primary-fixed items-center justify-center">
        <MaterialIcons name="menu-book" size={20} color="#301400" />
      </View>
      <View className="flex-col flex-1 min-w-0 gap-0.5">
        <Text
          numberOfLines={1}
          className="text-[14px] leading-5 text-m3-on-surface font-semibold"
        >
          {bookTitle.trim() || 'Untitled book'}
        </Text>
        <Text
          numberOfLines={1}
          className="text-[11px] leading-4 text-m3-on-surface-variant"
        >
          #{sequenceId} · {timeLabel}
        </Text>
      </View>
      <View className="bg-m3-secondary-container rounded-full px-2.5 py-1">
        <Text className="text-[11px] leading-4 text-m3-on-secondary-container font-bold">
          {durationLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SessionRow;
