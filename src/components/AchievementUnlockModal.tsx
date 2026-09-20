// components/AchievementUnlockModal.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Achievement } from '../types/achievement.types';

interface AchievementUnlockModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievements,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // Animations (stable across renders)
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const playAnimation = useCallback(() => {
    // Reset animations
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    confettiAnim.setValue(0);

    // Animate in sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, confettiAnim]);

  useEffect(() => {
    if (achievements.length > 0) {
      setVisible(true);
      playAnimation();
    }
  }, [achievements, playAnimation]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      playAnimation();
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setCurrentIndex(0);
      onClose();
    });
  };

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/95 justify-center items-center">
        {/* Confetti Background Effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ]}
        >
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                {
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  left: `${(i * 5) % 100}%`,
                  backgroundColor: ['#937051', '#C1A98C', '#F2EFE7'][i % 3],
                  transform: [
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, height],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Achievement Card */}
        <Animated.View
          className="rounded-3xl bg-stone-50 p-6 items-center"
          style={[
            {
              width: width * 0.85,
              maxWidth: 400,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                },
                android: {
                  elevation: 10,
                },
              }),
            },
          ]}
        >
          {/* Header */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-amber-700 text-center">
              🎉 Achievement Unlocked! 🎉
            </Text>
          </View>

          {/* Icon */}
          <View className="w-30 h-30 rounded-full bg-amber-200 justify-center items-center mb-5 border-4 border-amber-700">
            <Text className="text-6xl">{currentAchievement.icon}</Text>
          </View>

          {/* Content */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-black text-stone-900 mb-2 text-center">
              {currentAchievement.title}
            </Text>
            <Text className="text-base text-stone-900 opacity-70 text-center mb-4">
              {currentAchievement.description}
            </Text>
            <View className="bg-amber-700 px-5 py-2 rounded-full">
              <Text className="text-stone-50 text-base font-bold">
                +{currentAchievement.points} Points
              </Text>
            </View>
          </View>

          {/* Progress Indicator */}
          {achievements.length > 1 && (
            <View className="flex-row gap-2 mb-5">
              {achievements.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    {
                      width: idx === currentIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        idx === currentIndex ? '#937051' : '#C1A98C',
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            className="bg-amber-700 py-4 px-12 rounded-lg w-full"
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text className="text-stone-50 text-lg font-bold text-center">
              {currentIndex < achievements.length - 1 ? 'Next' : 'Awesome!'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
