import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent, ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper
} from "@/components/ui/actionsheet";
import { colors } from "@/constants/constants";
import { useReader } from "@epubjs-react-native/core";
import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ReaderNavigationProps = {
    reader: any
}

const ReaderNavigationOptions = ({reader}: ReaderNavigationProps) => {
    const {goToLocation} = useReader()

    const [searchText, setSearchText] = useState<string>("")
    const [isTOCOpen, setIsTOCOpen] = useState(false);

    const handleSearch = () => {
        console.log("searching Book")
        console.info(reader.getMeta())
    }

    const toggleTOC = () => {
        setIsTOCOpen(prev => !prev)

    }

    return (
        <>
            <View className="my-2 w-full">
                <Text className="text-2xl font-lato-bold text-white text-center mb-5">Navigation</Text>
            </View>
            <View className="gap-4 my-2 w-full items-start">
                <Text className="text-lg text-white text-center">Search Text</Text>
                <View className="flex-row items-center justify-center gap-8 mb-2 ">
                    <TextInput
                    value={searchText}
                    onChangeText={(value) => setSearchText(value)}
                    placeholder="Search for text in this book"
                    className="flex-1 border border-primary-500 rounded-full px-4"
                    />
                    <TouchableOpacity onPress={handleSearch} className="bg-primary-400 p-3 rounded-full items-center justify-center">
                    <Feather name="search" size={24} color="white" className=""/>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="gap-4 my-2 w-full items-start">
                <Text className="text-lg text-white text-center">Table of Contents</Text>
                <View className="flex-row items-center justify-center gap-8 mb-2 ">
                    <TouchableOpacity onPress={toggleTOC} className="bg-primary-400  rounded-full items-start w-full">
                    <Text className="text-white">{reader.toc[0]?.label || "TOC Unavailable"}</Text>
                   </TouchableOpacity>
                </View>
            </View>
            <TOCActionSheet reader={reader} toc={reader.toc} isOpen={isTOCOpen} handleClose={() => {setIsTOCOpen(false)}}/>
        </>
    )
}
export default ReaderNavigationOptions

export const TOCActionSheet = ({isOpen, handleClose, toc, reader}: {toc: any[], isOpen: boolean, handleClose: () => void, reader: any}) => {

    const handleChapterSelect =  (href: any) => {
        reader.goToLocation(href.href)
        handleClose()
    }

    return (
        <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[50]}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-6 h-1/3" style={{backgroundColor: colors.dark}}>
            <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>

            <View className="my-2 w-full">
                <Text className="text-2xl font-lato-bold text-white text-center mb-5">Table Of Contents</Text>
            </View>

            <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                {
                    toc.length > 0 ? toc.map((item, i) => (
                            <TouchableOpacity onPress={() => handleChapterSelect(item)} key={i} className={`p-2 mb-2 border-primary-500 w-full`}>
                                <Text className="items-start text-white text-lg">{item.label.trim()}</Text>
                                <View className="h-[2px] w-full bg-primary-500 opacity-10 mt-1"></View>
                            </TouchableOpacity>
                        ))
                        : <Text>TOC Unavailable</Text>
                }
            </ScrollView>
        </ActionsheetContent>
    </Actionsheet>)
}