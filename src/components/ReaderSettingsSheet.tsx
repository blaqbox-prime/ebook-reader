import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Theme, Themes } from '@epubjs-react-native/core';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type FontSizes = 'small' | 'medium' | 'large';

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
  // Fonts
  const [fontSize, setFontSize] = useState<FontSizes>('medium');

  const handleSelectFontSize = async (size: FontSizes) => {
    let px = '28px';
    if (size === 'small') px = '22px';
    if (size === 'large') px = '32px';

    const THEMES = Object.values(Themes).slice(0, 2);

    const index = Object.values(THEMES).indexOf(reader.theme);
    const newTheme = {
      ...THEMES[index],
      body: { 'font-size': px + ' !important', 'line-height': '2.4rem' },
    };

    reader.changeTheme(newTheme);
    setFontSize(size);
    // await AsyncStorage.setItem('readerTheme', JSON.stringify(newTheme));
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[50]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-6 h-1/3 bg-app-taupe-grey-900">
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
        >
          {/* Fonts */}
          <View className="flex-row items-center justify-center gap-16 my-4 ">
            <TouchableOpacity onPress={() => handleSelectFontSize('small')}>
              <View className="gap-2 items-center justify-center ">
                <FontAwesome
                  name="font"
                  size={18}
                  color={fontSize === 'small' ? 'gold' : 'white'}
                />
                <Text
                  className=""
                  style={{
                    color: fontSize === 'small' ? 'gold' : 'white',
                  }}
                >
                  Small
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSelectFontSize('medium')}>
              <View className="gap-2 items-center justify-center">
                <FontAwesome
                  name="font"
                  size={21}
                  color={fontSize === 'medium' ? 'gold' : 'white'}
                />
                <Text
                  className=""
                  style={{
                    color: fontSize === 'medium' ? 'gold' : 'white',
                  }}
                >
                  Medium
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSelectFontSize('large')}>
              <View className="gap-2 items-center justify-center">
                <FontAwesome
                  name="font"
                  size={24}
                  color={fontSize === 'large' ? 'gold' : 'white'}
                />
                <Text
                  className=""
                  style={{
                    color: fontSize === 'large' ? 'gold' : 'white',
                  }}
                >
                  Large
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* brightness */}
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ReaderSettingsSheet;
