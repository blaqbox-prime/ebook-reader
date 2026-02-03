import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Theme, Themes } from '@epubjs-react-native/core';
import { colors } from '@/src/constants';

type FontAdjusterProps = {
  reader: any;
};

type FontSizes = 'small' | 'medium' | 'large';

const FontAdjuster = ({ reader }: FontAdjusterProps) => {
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
