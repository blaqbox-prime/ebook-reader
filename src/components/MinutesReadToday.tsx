import { Text, TouchableOpacity } from 'react-native';
import React, { use, useEffect } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/src/constants';
import { useUserStatsStore } from '@/src/store/userStatsStore';
import SessionTrackingService from '@/src/services/SessionTrackingService';

const MinutesReadToday = () => {
  const { totalMinutesRead, setTotalMinutesRead } = useUserStatsStore();

  const fetchTotalMinutesRead = async () => {
    const service = new SessionTrackingService();
    const total = await service.getTotalDurationInMinutes();
    setTotalMinutesRead(total);
  };

  useEffect(() => {
    fetchTotalMinutesRead();
  });

  return (
    <TouchableOpacity className="bg-app-deep-mocha-600 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <Feather
        name="clock"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      />
      <Text className="text-white text-5xl font-heading">
        {totalMinutesRead}
      </Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Minutes Read
      </Text>
    </TouchableOpacity>
  );
};

export default MinutesReadToday;
