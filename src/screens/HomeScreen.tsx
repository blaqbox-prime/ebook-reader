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
    <SafeAreaView className="px-6 py-4 flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Greeting />
        {/* Search */}
        <SearchBox onChangeText={() => {}} className="my-8" />
        {/* Streak Summary */}
        <StreakSummary />
        {/* Reading Goals */}
        <View className=" h-20 w-full flex-row items-center gap-2">
          {/* Minutes Read Today */}
          <MinutesReadToday />
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
