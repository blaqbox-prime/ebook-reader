import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import BrightnessAdjuster from '@/src/components/BrightnessAdjuster';
import FontAdjuster from '@/src/components/FontAdjuster';

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

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[30, 50]}>
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
          {/* Fonts */}
          <FontAdjuster reader={reader} />

          {/* brightness */}
          <BrightnessAdjuster />
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ReaderSettingsSheet;
