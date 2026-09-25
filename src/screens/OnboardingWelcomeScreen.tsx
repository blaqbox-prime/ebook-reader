import { images } from '@/assets';
import {
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_STEPS,
} from '@/src/constants/onboarding';
import { OnboardingDots, ToastIconName, ActionToast } from '@/src/components';
import { useOnboardingStore, usePreferencesStore } from '@/src/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_COLORS = {
  primary: '#5c2d00',
  onSurfaceVariant: '#52443b',
  onSecondaryContainer: '#554424',
  tertiary: '#5a2e00',
  onPrimary: '#ffffff',
} as const;

const OnboardingWelcomeScreen = () => {
  const router = useRouter();
  const dailyGoalMinutes = usePreferencesStore(state => state.dailyGoalMinutes);
  const setDailyGoalMinutes = usePreferencesStore(
    state => state.setDailyGoalMinutes
  );
  const completeOnboarding = useOnboardingStore(
    state => state.completeOnboarding
  );
  const [toast, setToast] = useState<{
    message: string;
    icon?: ToastIconName;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, icon?: ToastIconName) => {
    setToast({ message, icon });
  }, []);

  const handleContinue = () => {
    router.push('/onboarding/profile');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(main)/(library)');
  };

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top', 'bottom']}>
      <View className="h-14 px-4 flex-row items-center justify-between">
        <Text className="text-[12px] leading-4 font-semibold uppercase tracking-wider text-m3-on-surface-variant">
          Onboarding
        </Text>
        <TouchableOpacity
          onPress={handleSkip}
          className="min-h-[44px] min-w-[44px] px-2 items-center justify-center active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text className="text-[14px] leading-5 font-semibold text-m3-primary">
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1"
      >
        <View className="px-4">
          <View className="w-full rounded-xl bg-m3-surface-low p-4 shadow-sm items-center overflow-hidden">
            <View className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-m3-secondary-container/40" />
            <View className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-m3-primary-fixed/30" />

            <View className="relative items-center justify-center mb-4">
              <View className="w-20 h-20 rounded-xl bg-m3-surface-lowest shadow-md items-center justify-center p-1 overflow-hidden">
                <Image
                  source={images.logo_transparent}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                  accessibilityLabel="PageTurner logo"
                />
              </View>
              <View className="absolute -bottom-1 -right-2 bg-m3-secondary-container rounded-full px-2 py-0.5 shadow-sm flex-row items-center gap-0.5">
                <MaterialIcons
                  name="local-cafe"
                  size={14}
                  color={ICON_COLORS.onSecondaryContainer}
                />
                <Text className="text-[11px] leading-4 font-semibold text-m3-on-secondary-container">
                  Cozy Flow
                </Text>
              </View>
            </View>

            <View className="w-full h-36 rounded-lg overflow-hidden bg-m3-surface-mid mb-4">
              <Image
                source={images.bookshelf}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel="A cozy shelf of books ready for reading"
              />
              <View className="absolute bottom-0 left-0 right-0 h-20 bg-m3-surface-highest/80 flex-row items-end justify-between p-2">
                <View className="bg-m3-surface-lowest/90 rounded-full px-2 py-1 flex-row items-center gap-1 shadow-sm">
                  <MaterialIcons
                    name="menu-book"
                    size={13}
                    color={ICON_COLORS.tertiary}
                  />
                  <Text className="text-[11px] leading-4 font-semibold text-m3-on-surface">
                    Chapter 1
                  </Text>
                </View>
                <View className="bg-m3-primary rounded-full px-2 py-1 flex-row items-center gap-1 shadow-sm">
                  <MaterialIcons
                    name="local-fire-department"
                    size={13}
                    color={ICON_COLORS.onPrimary}
                  />
                  <Text className="text-[11px] leading-4 font-semibold text-m3-on-primary">
                    Day 1 Ready
                  </Text>
                </View>
              </View>
            </View>

            <Text className="font-heading text-[28px] leading-9 font-semibold tracking-tight text-m3-on-surface mb-1 text-center">
              Rediscover the Joy of Reading
            </Text>
            <Text className="text-[14px] leading-5 text-m3-on-surface-variant max-w-[320px] text-center">
              Track your daily flow, capture unforgettable passages, and build a
              lifelong reading streak in a tranquil, coffee-toned sanctuary.
            </Text>
          </View>

          <View className="gap-2 mb-6">
            {ONBOARDING_STEPS.map(step => (
              <View
                key={step.title}
                className="p-4 rounded-xl bg-m3-surface-low shadow-sm flex-row items-start gap-4"
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${step.chipClassName}`}
                >
                  <MaterialIcons
                    name={step.icon}
                    size={20}
                    color={step.iconColor}
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[16px] leading-6 font-bold text-m3-on-surface">
                      {step.title}
                    </Text>
                    <Text
                      className={`rounded-full px-2 py-0.5 text-[11px] leading-4 font-semibold ${step.badgeClassName}`}
                    >
                      {step.badge}
                    </Text>
                  </View>
                  <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="p-4 rounded-xl bg-m3-surface-mid shadow-sm">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-1">
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={ICON_COLORS.primary}
                />
                <Text className="text-[14px] leading-5 font-semibold text-m3-on-surface">
                  Set your daily reading intention
                </Text>
              </View>
              <Text className="text-[11px] leading-4 font-bold text-m3-secondary">
                {dailyGoalMinutes} min goal
              </Text>
            </View>
            <Text className="text-[12px] leading-4 text-m3-on-surface-variant mb-4">
              Choose a daily cadence that feels mindful, not rushed. You can
              adjust this anytime.
            </Text>

            <View className="gap-1">
              {ONBOARDING_GOAL_OPTIONS.map(option => {
                const isActive = option.minutes === dailyGoalMinutes;
                return (
                  <TouchableOpacity
                    key={option.minutes}
                    onPress={() => {
                      setDailyGoalMinutes(option.minutes);
                      showToast(
                        `Daily goal set to ${option.minutes} minutes`,
                        'flag'
                      );
                    }}
                    activeOpacity={0.8}
                    className={`w-full text-left p-2 rounded-lg flex-row items-center justify-between ${
                      isActive
                        ? 'bg-m3-secondary-container shadow-sm'
                        : 'bg-m3-surface-low'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isActive ? 'bg-m3-primary' : 'bg-m3-surface-highest'
                        }`}
                      >
                        <MaterialIcons
                          name={
                            isActive
                              ? 'check'
                              : option.icon === 'check'
                                ? 'hourglass-empty'
                                : option.icon
                          }
                          size={16}
                          color={
                            isActive
                              ? ICON_COLORS.onPrimary
                              : ICON_COLORS.onSurfaceVariant
                          }
                        />
                      </View>
                      <Text
                        className={`text-[14px] leading-5 ${
                          isActive ? 'font-bold' : 'font-semibold'
                        } ${
                          isActive
                            ? 'text-m3-on-secondary-container'
                            : 'text-m3-on-surface'
                        }`}
                      >
                        {option.title}
                      </Text>
                    </View>
                    <Text
                      className={`text-[11px] leading-4 px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-m3-primary/10 font-bold text-m3-secondary'
                          : 'text-m3-on-surface-variant'
                      }`}
                    >
                      {option.caption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="h-20 px-4 flex-row items-center justify-between">
        <OnboardingDots step={1} total={2} />
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          className="h-11 px-6 rounded-full bg-m3-primary flex-row items-center gap-1 shadow-md active:scale-[0.99]"
          accessibilityRole="button"
          accessibilityLabel="Continue to profile setup"
        >
          <Text className="text-[14px] leading-5 font-semibold text-m3-on-primary">
            Continue
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color={ICON_COLORS.onPrimary}
          />
        </TouchableOpacity>
      </View>

      <ActionToast
        message={toast?.message ?? null}
        icon={toast?.icon}
        visible={toast !== null}
      />
    </SafeAreaView>
  );
};

export default OnboardingWelcomeScreen;
