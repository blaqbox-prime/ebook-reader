import { View, ScrollView, Text, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ContinueReadingList,
  EmptyStateView,
  Greeting,
  SearchBox,
} from '@/src/components';
import MinutesReadToday from '@/src/components/MinutesReadToday';
import StreakSummary from '@/src/components/StreakSummary';
import XPSummary from '@/src/components/XPSummary';
import NewAdded from '@/src/components/NewAdded';
import { useLibraryStore } from '@/src/store';
import { images } from '@/assets';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { books } = useLibraryStore();
  const nav = useNavigation();
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

        {books.length === 0 && (
          <EmptyStateView
            image={images.book_lover}
            message="Your Library is empty. Add books and start reading"
            showButton={true}
            buttonText="Start Reading"
            buttonAction={() => {
              nav.navigate('(Library)' as never);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
