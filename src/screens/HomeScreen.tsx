import { View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
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
  const { books, loading, fetchBooks } = useLibraryStore();
  const [hydrated, setHydrated] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    fetchBooks().finally(() => setHydrated(true));
  }, [fetchBooks]);

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

        {hydrated && !loading && books.length === 0 && (
          <EmptyStateView
            image={images.book_lover}
            message="Your Library is empty. Add books and start reading"
            showButton={true}
            buttonText="Start Reading"
            buttonAction={() => {
              nav.navigate('(library)' as never);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
