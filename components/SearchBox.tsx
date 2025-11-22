import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { TextInput, View } from 'react-native'

type SearchBoxProps = {
    onChangeText: (text :string) => void,
    className?: string | undefined,
}

const SearchBox = ({onChangeText, className}: SearchBoxProps) => {
  return (
    <View className={`bg-primary/25 w-full p-4 rounded-full flex-row gap-3 items-center ${className}`}>
                    <Feather name="search" size={24} color="black" />
                    <TextInput
                      placeholder="Search book title..."
                      className=""
                      onChangeText={(text) => onChangeText(text)}
                    />
                  </View>
  )
}

export default SearchBox