import React from 'react';
import { Text, View } from 'react-native';
import { useUserProfileStore } from '@/src/store';

const Greeting = () => {
  const displayName = useUserProfileStore(state => state.displayName);
  const time = new Date().getHours();
  const greeting = `Good ${
    time > 17
      ? 'Evening'
      : time > 11
        ? 'Afternoon'
        : time > 4
          ? 'Morning'
          : 'Evening'
  } ${displayName}`;

  return (
    <View className="flex flex-col">
      <Text className="font-heading text-5xl text-m3-primary leading-[3rem] tracking-wider max-w-[90%]">
        {greeting}
      </Text>
      <Text className="font-lato-regular text-sm text-m3-on-surface-variant leading-5 mt-1">
        What are we reading today?
      </Text>
    </View>
  );
};

export default Greeting;
