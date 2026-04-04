import { View, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContinueReadingList, Greeting, SearchBox } from '@/src/components';
import MinutesReadToday from '@/src/components/MinutesReadToday';
import StreakSummary from '@/src/components/StreakSummary';
import XPSummary from '@/src/components/XPSummary';
import NewAdded from '@/src/components/NewAdded';

const HomeScreen = () => {
  return (
    <SafeAreaView className=" bg-white px-6 py-4 flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Greeting />
        {/* Search */}
        <SearchBox onChangeText={() => {}} className="my-8" />
        {/* Reading Goals & Streak */}
        <View className=" h-40 w-full flex-row justify-between gap-2">
          {/* Minutes Read Today */}
          <MinutesReadToday />
          {/* Streak Summary */}
          <StreakSummary />
          {/* Streak Summary */}
          <XPSummary />
        </View>
        {/* Continue Reading */}
        <ContinueReadingList />
        {/* Newly Added */}
        <NewAdded />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
