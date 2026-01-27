import Feather from '@expo/vector-icons/Feather'
import { TextInput, View } from 'react-native'
import _ from 'lodash';

type SearchBoxProps = {
    onChangeText: (text :string) => void,
    className?: string | undefined,
}

const SearchBox = ({onChangeText, className}: SearchBoxProps) => {
  return (
    <View className={`bg-app-deep-mocha-800 w-full py-2 px-4 rounded-full flex-row gap-3 items-center ${className}`}>
                    <Feather name="search" size={22} color="white" />
                    <TextInput
                      placeholder="Search book title..."
                      className="text-white placeholder:text-white flex-1 py-2"
                      onChangeText={(text) => _.debounce(() => onChangeText(text), 1000)()}
                    />
                  </View>
  )
}

export default SearchBox