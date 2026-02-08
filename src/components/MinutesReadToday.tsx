import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/src/constants';

const MinutesReadToday = () => {
  return (
    <TouchableOpacity className="bg-app-deep-mocha-600 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <Feather
        name="clock"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      />
      <Text className="text-white text-5xl font-heading">36</Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Minutes Read
      </Text>
    </TouchableOpacity>
  );
};

export default MinutesReadToday;
