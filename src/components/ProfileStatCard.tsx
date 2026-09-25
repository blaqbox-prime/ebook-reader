import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { Text, View } from 'react-native';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type ProfileStatCardProps = {
  icon: IconName;
  value: string;
  label: string;
  accent?: 'surface' | 'secondary';
};

const ProfileStatCard = ({
  icon,
  value,
  label,
  accent = 'surface',
}: ProfileStatCardProps) => {
  const isSecondary = accent === 'secondary';

  return (
    <View
      className={`flex-1 rounded-xl p-4 flex-col gap-2 ${
        isSecondary ? 'bg-m3-secondary-container' : 'bg-m3-surface-mid'
      }`}
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          isSecondary ? 'bg-m3-primary-fixed' : 'bg-m3-surface-highest'
        }`}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color={isSecondary ? '#301400' : '#52443b'}
        />
      </View>
      <View className="flex-col gap-0.5">
        <Text
          className={`text-lg leading-6 font-bold ${
            isSecondary
              ? 'text-m3-on-secondary-container'
              : 'text-m3-on-surface'
          }`}
        >
          {value}
        </Text>
        <Text
          className={`text-[11px] leading-4 ${
            isSecondary
              ? 'text-m3-on-secondary-container/80'
              : 'text-m3-on-surface-variant'
          }`}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};

export default ProfileStatCard;
