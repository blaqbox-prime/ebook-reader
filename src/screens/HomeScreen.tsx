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

const HomeScreen = () => {
  const { books, loading, fetchBooks } = useLibraryStore();
  const [hydrated, setHydrated] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    fetchBooks().finally(() => setHydrated(true));
  }, [fetchBooks]);

  return (
    <SafeAreaView className="bg-m3-surface flex-1" edges={['top']}>
      <View className="h-16 px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 flex-1 min-w-0">
          <Image
            source={images.logo_transparent}
            className="h-8 w-8"
            resizeMode="contain"
          />
          <View className="flex-col min-w-0">
            <Text
              numberOfLines={1}
              className="font-heading text-[22px] leading-7 text-m3-primary tracking-tight"
            >
              PageTurner
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => nav.navigate('profile/index' as never)}
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <View className="w-8 h-8 rounded-full bg-m3-surface-high items-center justify-center">
            <MaterialIcons name="person" size={20} color="#52443b" />
          </View>
        </TouchableOpacity>
      </View>

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
