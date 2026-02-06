import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContinueReadingList, Greeting, SearchBox } from '@/src/components';

const HomeScreen = () => {
  return (
    <SafeAreaView className=" bg-white px-6 py-4 flex-1">
      <Greeting />
      {/* Search */}
      <SearchBox onChangeText={() => {}} className="my-8" />
      {/* Reading Goals & Streak */}
      {/* Continue Reading */}
      <ContinueReadingList />
      {/* Newly Added */}

      <View></View>
    </SafeAreaView>
  );
};

export default HomeScreen;
