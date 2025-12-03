import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { TextInput, View } from 'react-native'

type SearchBoxProps = {
    onChangeText: (text :string) => void,
    className?: string | undefined,
}

const SearchBox = ({onChangeText, className}: SearchBoxProps) => {
  return (
    <View className={`bg-primary-900 w-full py-2 px-4 rounded-full flex-row gap-3 items-center ${className}`}>
                    <Feather name="search" size={22} color="black" />
                    <TextInput
                      placeholder="Search book title..."
                      className="text-typography-black placeholder:text-typography-black"
                      onChangeText={(text) => onChangeText(text)}
                    />
                  </View>
  )
}

export default SearchBox