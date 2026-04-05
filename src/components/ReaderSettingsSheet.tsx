import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

import BrightnessAdjuster from '@/src/components/BrightnessAdjuster';
import FontAdjuster from '@/src/components/FontAdjuster';
import Feather from '@expo/vector-icons/Feather';
import SearchBox from '@/src/components/SearchBox';
import SearchedTermSheet from '@/src/components/SearchedTermSheet';

type ReaderSettingsSheetProps = {
  isOpen: boolean;
  handleClose: () => void;
  reader: any;
};

const ReaderSettingsSheet = ({
  isOpen,
  handleClose,
  reader,
}: ReaderSettingsSheetProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isResultsOpen, setResultsOpen] = useState<boolean>(false);

  const handleTextSearch = () => {
    search(searchTerm);
    setResultsOpen(true);
  };

  const { search } = reader;

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[35]}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="py-3 bg-app-ash-brown-800 ">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="my-2 w-full">
            <Text className="text-2xl font-lato-bold text-white text-center mb-5">
              Reader Settings
            </Text>
          </View>

          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            className="px-8"
          >
            {/* Search term in book */}
            <View className="items-center flex-row justify-between w-full gap-4 mb-4">
              <View className="flex-1">
                <SearchBox
                  onChangeText={text => {
                    setSearchTerm(text);
                  }}
                  placeholder="Search for term in book..."
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  handleTextSearch();
                }}
                className="aspect-square p-3 rounded-full bg-app-ash-brown-400 items-center justify-center"
              >
                <Feather name="search" size={24} color="white" className="" />
              </TouchableOpacity>
            </View>

            {/* Fonts */}
            <FontAdjuster reader={reader} />

            {/* brightness */}
            <BrightnessAdjuster />
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>
      <SearchedTermSheet
        handleClose={() => {
          setResultsOpen(false);
        }}
        isOpen={isResultsOpen}
        searchTerm={searchTerm}
        reader={reader}
      />
    </>
  );
};

export default ReaderSettingsSheet;
