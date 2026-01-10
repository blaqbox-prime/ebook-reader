import { colors } from "@/constants/constants";
import { Themes } from "@epubjs-react-native/core";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type FontSizes = "small" | "medium" | "large"

type ReaderTypographyOptionsProps = {
    selectedFontSize?: FontSizes
    setTheme: any,
    reader: any
}


const ReaderTypographyOptions = ({selectedFontSize, setTheme, reader} : ReaderTypographyOptionsProps) => {

    const [fontSize, setFontSize] = useState<FontSizes>(selectedFontSize || "medium");

    const handleSelectFontSize = async (size: FontSizes) => {
        let px = "22px";
        if (size === "small") px = "18px";
        if (size === "large") px = "24px";

        const THEMES = Object.values(Themes);
        const newTheme = {
            ...THEMES[0],
            "body": { "font-size": px + " !important", "line-height": "2.2rem" }
        }

        console.log(THEMES[0])
        console.log(newTheme)
        reader.changeTheme(newTheme)
        
        console.log(THEMES[0])
        setFontSize(size)
        await AsyncStorage.setItem("readerTheme", JSON.stringify(newTheme));

    };


    return (
        <>
            <View className="my-2 w-full">
                <Text className="text-2xl font-lato-bold text-white text-center mb-20">Typography</Text>
            </View>
            <View className="flex-row items-center justify-center gap-16 my-4 ">
                <TouchableOpacity onPress={() => handleSelectFontSize("small")}>
                    <View className="gap-2 items-center justify-center ">
                        <FontAwesome name="font" size={18} color={fontSize === "small" ? colors.primary : "white"} />
                        <Text className="" style={{color: fontSize === "small" ? colors.primary : "white"}}>Small</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectFontSize("medium")}>
                    <View className="gap-2 items-center justify-center">
                        <FontAwesome name="font" size={21} color={fontSize === "medium" ? colors.primary : "white"} />
                        <Text className="" style={{color: fontSize === "medium" ? colors.primary : "white"}}>Medium</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectFontSize("large")}>
                    <View className="gap-2 items-center justify-center">
                        <FontAwesome name="font" size={24} color={fontSize === "large" ? colors.primary : "white"} />
                        <Text className="" style={{color: fontSize === "large" ? colors.primary : "white"}}>Large</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </>
    )
}

export default ReaderTypographyOptions