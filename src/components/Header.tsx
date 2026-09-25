import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { images } from '@/assets';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';

type HeaderProps = {
  title?: string;
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
};

const Header = ({
  title = 'PageTurner',
  showNotifications = false,
  onNotificationsPress,
}: HeaderProps) => {
  const nav = useNavigation();

  return (
    <View className="h-16 px-6 flex-row items-center justify-between">
      <View className="flex-row items-center gap-1 flex-1 min-w-0">
        <Image
          source={images.logo_transparent}
          className="h-8 w-8"
          resizeMode="contain"
        />
        <View className="flex-col min-w-0">
          <Text
            numberOfLines={1}
            className="font-heading text-[22px] leading-8 text-m3-primary tracking-tight"
          >
            {title}
          </Text>
        </View>
      </View>
      {showNotifications && (
        <TouchableOpacity
          onPress={onNotificationsPress}
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <MaterialIcons name="notifications-none" size={22} color="#52443b" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => nav.navigate('profile/index' as never)}
        className="w-11 h-11 items-center justify-center rounded-full"
      >
        <View className="w-8 h-8 rounded-full bg-m3-surface-high items-center justify-center">
          <MaterialIcons name="person" size={20} color="#52443b" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Header;
