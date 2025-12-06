import {View, Text, Image, TouchableWithoutFeedback, TouchableOpacity} from 'react-native'
import React, {useCallback, useState} from 'react'
import {images} from "@/assets";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import {colors} from "@/constants/constants";

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
        icon: <Feather name="sun" size={ICON_SIZE} color={colors.dark} />,
        label: "Adjust Brightness",
        action: "adjustBrightness"
    },
]

const ReaderOptionsFAB = ({showFab = false}: {showFab: boolean}) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(prev => !prev);
    const Backdrop = () => (
            <TouchableWithoutFeedback onPress={toggleOpen}>
        <View
            className="absolute top-0 left-0 right-0 bottom-0 z-10 inset-0 bg-black opacity-10"
        >

        </View>
            </TouchableWithoutFeedback>
    );

    const handleActionPress = useCallback((action: string, label: string) => {
        // Implement specific logic for each action here
        switch (action) {
            case "adjustFont": {
             alert("Show modal to adjust font")
            }
            break;
            case "nightMode": {
                alert("Change to night mode")
            }
            break;
            case "adjustBrightness": {
                alert("show modal to adjust brightness")
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
export default ReaderOptionsFAB
