import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Brightness from 'expo-brightness';
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@/components/ui/slider';
import Feather from '@expo/vector-icons/Feather';

const BrightnessAdjuster = () => {
  const [permissionStatus, setStatus] = useState<Brightness.PermissionStatus>(
    Brightness.PermissionStatus.UNDETERMINED
  );
  const [currentBrightness, setBrightness] = useState(1);

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        await Brightness.setSystemBrightnessAsync(currentBrightness);
        setStatus(status);
      }
    })();
  }, [permissionStatus, currentBrightness]);

  const updateBrightness = async (value: number) => {
    console.log('Update brightness to ' + value);
    await Brightness.setSystemBrightnessAsync(value);
    setBrightness(value);
  };

  return (
    <View className="items-center justify-center gap-8 my-4 w-full ">
      <Slider
        defaultValue={currentBrightness}
        onChange={updateBrightness}
        size="lg"
        orientation="horizontal"
        isDisabled={false}
        isReversed={false}
        className=""
        minValue={0}
        maxValue={1}
        step={0.1}
      >
        <SliderTrack className="bg-white h-1 w-full">
          <SliderFilledTrack className="bg-app-deep-mocha-400" />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <View className="justify-between flex-row items-center w-full">
        <Feather name="moon" size={22} color="white" />
        <Feather name="sun" size={22} color="white" />
      </View>
    </View>
  );
};

export default BrightnessAdjuster;
