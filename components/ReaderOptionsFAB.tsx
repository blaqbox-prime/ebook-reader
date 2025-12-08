import {View, Text, Image, TouchableWithoutFeedback, TouchableOpacity} from 'react-native'
import React, {useCallback, useState} from 'react'
import {images} from "@/assets";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import {colors} from "@/constants/constants";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent, ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper, ActionsheetItem, ActionsheetItemText
} from "@/components/ui/actionsheet";
import {useReader} from "@epubjs-react-native/core";

const ICON_SIZE = 20;

const OPTION_ITEMS = [
    {
        icon: <FontAwesome name="font" size={ICON_SIZE} color={colors.dark} />,
        label: "Adjust Font",
        action: "adjustFont",
    },
    {
        icon: <Feather name="moon" size={ICON_SIZE} color={colors.dark} />,
        label: "Night Mode",
        action: "nightMode"
    },
    {
        icon: <MaterialIcons name="toc" size={ICON_SIZE} color={colors.dark} /> ,
        label: "Table of Contents",
        action: "toc"
    },
    {
        icon: <Feather name="sun" size={ICON_SIZE} color={colors.dark} />,
        label: "Adjust Brightness",
        action: "adjustBrightness"
    },
]

const ReaderOptionsFAB = ({showFab = false, setShowActionSheet}: {showFab: boolean, setShowActionSheet:any}) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(prev => !prev);

    const Backdrop = () => (
            <TouchableWithoutFeedback onPress={toggleOpen}>
        <View
            className="absolute top-0 left-0 right-0 bottom-0 z-10 inset-0 bg-black opacity-15"
        >

        </View>
            </TouchableWithoutFeedback>
    );
    const handleActionPress = useCallback((action: string, label: string) => {
        // Implement specific logic for each action here
        switch (action) {
            case "adjustFont": {
             setShowActionSheet(true)
            }
            break;
            case "nightMode": {
                setShowActionSheet(true)
            }
            break;
            case "adjustBrightness": {
                setShowActionSheet(true)
            }
            break;
            case "toc": {
                setShowActionSheet(true)
            }
        }
        setIsOpen(false); // Close the menu after action

    }, []);

    return (
        <>
            {isOpen && <Backdrop />}
        <View className="z-10 absolute bottom-10 right-10 items-end">

            {isOpen && (
                // Vertical stack for options, reverse order to ensure the list expands upwards
                <View className="flex flex-col space-y-3 mb-4 items-end">
                    {OPTION_ITEMS.slice().reverse().map((option, index) => {
                        return (
                                <TouchableOpacity
                                    key={option.label}
                                    onPress={() => handleActionPress(option.action, option.label)}
                                >
                            <View  className="flex-row items-center gap-3 my-3 pr-2">

                                {/* Optional Label for better UX */}
                                <Text
                                    className="px-3 py-2 rounded-lg shadow-md"
                                    style={{ backgroundColor: colors.secondary, color: colors.dark }}
                                >
                                    {option.label}
                                </Text>

                                {/* Individual Option Button */}
                                    <View  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                           style={{ backgroundColor: colors.secondary }}>
                                        {option.icon}
                                    </View>
                            </View>
                                </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {showFab && (<TouchableWithoutFeedback onPress={toggleOpen}>
                <View className="items-center justify-center bg-primary-500 h-16 w-16 p-2 rounded-full z-50 ">
                    <Image
                        source={images.LOGO_TRANSPARENT}
                        className="w-full h-full overflow-hidden"
                    />
                </View>
            </TouchableWithoutFeedback>)}
        </View>

        </>
    )
}

type ReaderOptionsActionSheetProps = {
    showActionsheet: boolean;
    handleClose: () => void
    selectedFontSize?: "small" | "medium" | "large"
    reader: any
}

export const ReaderOptionsActionSheet = ({showActionsheet, handleClose, reader, selectedFontSize = "small"}: ReaderOptionsActionSheetProps) => {
    return (
        <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="p-6" style={{backgroundColor: colors.dark}}>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <ReaderTypographyOptions selectedFontSize={selectedFontSize} reader={reader}/>

            </ActionsheetContent>
        </Actionsheet>
    )
}

type FontSizes = "small" | "medium" | "large"

type ReaderTypographyOptionsProps = {
    selectedFontSize?: FontSizes
    reader?: any
}


export const ReaderTypographyOptions = ({selectedFontSize,reader} : ReaderTypographyOptionsProps) => {

    const [fontSize, setFontSize] = useState<FontSizes>(selectedFontSize || "medium");

    const handleSelectFontSize = (size: FontSizes) => {
        setFontSize(size)

        let value = "24px"; // default
        if (size === "small") value = "16px";
        if (size === "large") value = "32px";

    }

    return (
        <>
            <View className="my-2">
                <Text className="text-2xl font-lato-bold text-white">Typography</Text>
            </View>
            <View className="flex-row items-center gap-16 my-2 ">
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

export default ReaderOptionsFAB
