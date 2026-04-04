import { Text, TouchableOpacity } from 'react-native';
import React from 'react';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { colors } from '@/src/constants';
const XPSummary = () => {
  return (
    <TouchableOpacity className="bg-app-deep-mocha-800 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <SimpleLineIcons
        name="badge"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      />
      <Text className="text-white text-5xl font-heading">126</Text>
      <Text className="text-app-khaki-beige-100 font-heading">XP</Text>
    </TouchableOpacity>
  );
};

export default XPSummary;
