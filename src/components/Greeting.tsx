import { View, Text } from 'react-native';
import React from 'react';

const time: number = new Date().getHours();
const username: string = 'Natasha';
const greeting: string = `Good ${time > 17 ? 'Evening' : time > 11 ? 'Afternoon' : time > 4 ? 'Morning' : 'Evening'} ${username}`;

const Greeting = () => {
  return (
    <View className="mt-10">
      <Text className="text-5xl font-heading w-3/4 mb-2">{greeting}</Text>
      <Text className="text-xl text-gray-400 font-lato-regular">
        What are we reading today?
      </Text>
    </View>
  );
};

export default Greeting;
