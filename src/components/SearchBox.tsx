import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';

type SearchBoxProps = {
  onChangeText: (text: string) => void;
  /** Fired when the user confirms the keyboard, for navigating to results. */
  onSubmitEditing?: ((text: string) => void) | undefined;
  className?: string | undefined;
  placeholder?: string | undefined;
};

const SearchBox = ({
  onChangeText,
  onSubmitEditing,
  className,
  placeholder = 'Search title, author, or genre...',
}: SearchBoxProps) => {
  const [text, setText] = useState('');

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
        returnKeyType="search"
        value={text}
        onChangeText={value => {
          setText(value);
          debouncedOnChangeText(value);
        }}
        onSubmitEditing={() => onSubmitEditing?.(text)}
        className="flex-1 py-1 text-m3-on-surface font-lato-regular text-base leading-5"
      />
      {text.length > 0 ? (
        <TouchableWithoutFeedback
          onPress={() => {
            setText('');
            debouncedOnChangeText('');
          }}
        >
          <View className="w-9 h-9 items-center justify-center rounded-full">
            <MaterialIcons name="close" size={20} color="#52443b" />
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <View className="w-9 h-9 items-center justify-center rounded-full">
          <MaterialIcons name="mic" size={20} color="#52443b" />
        </View>
      )}
    </View>
  );
};

export default SearchBox;
