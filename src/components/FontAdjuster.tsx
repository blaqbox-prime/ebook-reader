import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/constants';
import { ReaderContext } from '@/src/types/reader.types';
import { usePreferencesStore } from '@/src/store';
import { FontSizePreference } from '@/src/store/preferencesStore';

type FontAdjusterProps = {
  reader: ReaderContext;
};

const FontAdjuster = ({ reader }: FontAdjusterProps) => {
  const fontSize = usePreferencesStore(state => state.fontSize);
  const setFontSize = usePreferencesStore(state => state.setFontSize);

  const handleSelectFontSize = (size: FontSizePreference) => {
    let px = '28px';
    if (size === 'small') px = '22px';
    if (size === 'large') px = '32px';

    const newTheme = {
      ...reader.theme,
      body: {
        ...reader.theme.body,
        'font-size': px + ' !important',
        'line-height': '2.4rem',
      },
    };

    reader.changeTheme(newTheme);
    setFontSize(size);
  };
  return (
    <View className="flex-row items-center justify-center gap-16 my-4 ">
      <TouchableOpacity onPress={() => handleSelectFontSize('small')}>
        <View className="gap-2 items-center justify-center ">
          <FontAwesome
            name="font"
            size={18}
            color={
              fontSize === 'small' ? colors['golden-apricot'][300] : 'white'
            }
          />
          <Text
            className=""
            style={{
              color:
                fontSize === 'small' ? colors['golden-apricot'][300] : 'white',
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
            color={
              fontSize === 'medium' ? colors['golden-apricot'][300] : 'white'
            }
          />
          <Text
            className=""
            style={{
              color:
                fontSize === 'medium' ? colors['golden-apricot'][300] : 'white',
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
            color={
              fontSize === 'large' ? colors['golden-apricot'][300] : 'white'
            }
          />
          <Text
            className=""
            style={{
              color:
                fontSize === 'large' ? colors['golden-apricot'][300] : 'white',
            }}
          >
            Large
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FontAdjuster;
