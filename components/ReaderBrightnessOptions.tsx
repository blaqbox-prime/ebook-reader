import {View, Text, TouchableOpacity} from 'react-native'
import React, {useEffect, useState} from 'react'
import Feather from '@expo/vector-icons/Feather';
import {Slider, SliderFilledTrack, SliderThumb, SliderTrack} from "@/components/ui/slider";
import * as Brightness from 'expo-brightness';
import _ from "lodash"


const ReaderBrightnessOptions = () => {

    const [permissionStatus, setStatus] = useState<Brightness.PermissionStatus>(Brightness.PermissionStatus.UNDETERMINED);
    const [currentBrightness, setBrightness] = useState(1)


    useEffect(() => {
        (async () => {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === 'granted') {
                await Brightness.setSystemBrightnessAsync(currentBrightness);
                setStatus(status);
            }
        })();
    }, [permissionStatus]);

    const updateBrightness = async (value: number) => {
            console.log("Update brightness to " + value )
            await Brightness.setSystemBrightnessAsync(value);
            setBrightness(value)
    }

    return (
        <>
            <View className="my-2 w-full">
                <Text className="text-2xl font-lato-bold text-white text-center mb-20">Brightness</Text>
            </View>
            <View className="flex-row items-center justify-center gap-8 my-2 ">
                <Slider
                    defaultValue={currentBrightness}
                    onChange={updateBrightness}
                    size="lg"
                    orientation="horizontal"
                    isDisabled={false}
                    isReversed={false}
                    className="w-1/2"
                    minValue={0}
                    maxValue={1}
                    step={0.1}
                >
                    <SliderTrack className="bg-white h-1">
                        <SliderFilledTrack className="bg-primary-500"/>
                    </SliderTrack>
                    <SliderThumb  />
                </Slider>
                <Feather name="sun" size={24} color="white" />
            </View>
        </>
    )
}
export default ReaderBrightnessOptions
