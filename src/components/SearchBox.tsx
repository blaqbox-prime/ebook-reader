import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput, View } from 'react-native';
import { useEffect, useMemo } from 'react';
import _ from 'lodash';

type SearchBoxProps = {
  onChangeText: (text: string) => void;
  className?: string | undefined;
  placeholder?: string | undefined;
};

const SearchBox = ({
  onChangeText,
  className,
  placeholder = 'Search title, author, or genre...',
}: SearchBoxProps) => {
  const debouncedOnChangeText = useMemo(
    () => _.debounce(onChangeText, 300),
    [onChangeText]
  );

  useEffect(
    () => () => debouncedOnChangeText.cancel(),
    [debouncedOnChangeText]
  );

  return (
    <View
      className={`bg-m3-surface-high rounded-full h-14 px-4 flex-row items-center shadow-sm ${className}`}
    >
      <MaterialIcons name="search" size={24} color="#5c2d00" className="mr-2" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#857469"
        className="flex-1 py-1 text-m3-on-surface font-lato-regular text-base leading-5"
        onChangeText={text => debouncedOnChangeText(text)}
      />
      <View className="w-9 h-9 items-center justify-center rounded-full">
        <MaterialIcons name="mic" size={20} color="#52443b" />
      </View>
    </View>
  );
};

export default SearchBox;
