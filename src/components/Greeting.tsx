import { View, Text } from 'react-native';
import React from 'react';

const time: number = new Date().getHours();
const username: string = 'Natasha';
const greeting: string = `Good ${time > 17 ? 'Evening' : time > 11 ? 'Afternoon' : time > 4 ? 'Morning' : 'Evening'} ${username}`;

const Greeting = () => {
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
