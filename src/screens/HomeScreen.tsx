import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
import Header from '@/src/components/Header';

const HomeScreen = () => {
  const { books, loading, fetchBooks } = useLibraryStore();
  const [hydrated, setHydrated] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    fetchBooks().finally(() => setHydrated(true));
  }, [fetchBooks]);

  return (
    <SafeAreaView className="bg-m3-surface flex-1" edges={['top']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-16">
          <View className="flex-row items-center justify-between gap-4">
            <Greeting />
          </View>

          <View className="mt-4">
            <SearchBox onChangeText={() => {}} />
          </View>

          <View className="flex-row gap-2 mt-5">
            <StreakSummary />
            <MinutesReadToday />
            <XPSummary />
          </View>

          <View className="mt-7">
            <ContinueReadingList />
          </View>

          <View className="mt-8">
            <NewAdded />
          </View>

          <View className="bg-m3-surface-mid rounded-xl p-4 mt-8 flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-m3-primary-container items-center justify-center">
              <MaterialIcons name="auto-stories" size={20} color="#fdb37b" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-[12px] leading-4 italic text-m3-on-surface">
                {
                  '\u201CA reader lives a thousand lives before he dies. The man who never reads lives only one.\u201D'
                }
              </Text>
              <Text className="text-[11px] leading-4 text-m3-outline mt-1">
                — George R.R. Martin
              </Text>
            </View>
          </View>

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
        </View>
        <View className="h-16 w-full"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
