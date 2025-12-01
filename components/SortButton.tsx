import {View, Text} from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {colors} from "@/constants/constants";

const SortButton = () => {
    return (
        <View>
            <MaterialCommunityIcons name="sort-bool-ascending" size={21} color={colors.dark} />
        </View>
    )
}
export default SortButton
