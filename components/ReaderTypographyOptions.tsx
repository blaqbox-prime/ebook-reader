import React, {useState} from "react";
import {useReader} from "@epubjs-react-native/core";
import {Text, TouchableOpacity, View} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {colors} from "@/constants/constants";

type FontSizes = "small" | "medium" | "large"

type ReaderTypographyOptionsProps = {
    selectedFontSize?: FontSizes
    setTheme: any
}


const ReaderTypographyOptions = ({selectedFontSize, setTheme} : ReaderTypographyOptionsProps) => {

    const [fontSize, setFontSize] = useState<FontSizes>(selectedFontSize || "medium");
    const reader = useReader();

    const handleSelectFontSize = (size: FontSizes) => {
        let px = "24px";
        if (size === "small") px = "16px";
        if (size === "large") px = "32px";


        console.log(reader.theme)
        reader.changeTheme({
            "body": { "font-size": px + " !important" }
        })
        reader.theme = {
            ...reader.theme,
            "body": { ...reader.theme["body"],
                "font-size": px + " !important" }
        }
        console.log("UPDATED")
        console.log(reader.theme["body"]);
        setTheme({
            ...reader.theme,
            "body": { ...reader.theme["body"],
                "font-size": px + " !important" }
        })

        setFontSize(size)

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