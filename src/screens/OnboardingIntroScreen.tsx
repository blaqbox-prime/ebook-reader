import { images } from '@/assets';
import { OnboardingDots } from '@/src/components';
import { useOnboardingStore } from '@/src/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_COLORS = {
  primary: '#5c2d00',
  onPrimary: '#ffffff',
  secondary: '#6e5c39',
} as const;

const OnboardingIntroScreen = () => {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore(
    state => state.completeOnboarding
  );

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(main)/(library)');
  };

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top', 'bottom']}>
      {/* Subtle ambient glow */}
      <View className="flex-1 px-4 py-4 overflow-hidden">
        <View className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-m3-secondary-container/25" />
        <View className="absolute top-1/2 -right-28 w-64 h-64 rounded-full bg-m3-primary-fixed/20" />

        {/* Top bar */}
        <View className="flex-row items-center justify-between z-10">
          <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-m3-surface-low">
            <MaterialIcons name="eco" size={16} color={ICON_COLORS.primary} />
            <Text className="text-[11px] leading-4 font-semibold tracking-wide text-m3-on-surface-variant">
              Pure Offline Reading
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            className="min-h-[44px] min-w-[44px] px-3 items-center justify-center rounded-full active:bg-m3-secondary-container/40"
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding intro"
          >
            <Text className="text-[12px] leading-4 font-semibold text-m3-primary">
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main centerpiece */}
        <View className="flex-1 items-center justify-center py-6 z-10">
          <View className="mb-6">
            <View className="absolute -inset-1.5 rounded-2xl bg-m3-primary-fixed/60" />
            <View className="relative w-24 h-24 rounded-2xl bg-m3-surface-lowest shadow-md items-center justify-center overflow-hidden">
              <Image
                source={images.logo}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel="PageTurner logo"
              />
            </View>
          </View>

          <View className="items-center max-w-[320px]">
            <Text className="font-heading text-[32px] leading-10 font-semibold tracking-tight text-m3-on-surface">
              Page Turner
            </Text>
            <Text className="text-[16px] leading-6 text-m3-on-surface-variant mt-1 text-center">
              Your cozy offline reading sanctuary
            </Text>
          </View>

          <View className="w-full max-w-[320px] items-center gap-2 mt-10">
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.85}
              className="w-full h-14 px-8 rounded-full bg-m3-primary flex-row items-center justify-center gap-2 shadow-lg active:scale-[0.99] active:bg-[#633610]"
              accessibilityRole="button"
              accessibilityLabel="Let's get started"
              accessibilityHint="Continues to the reading goal setup"
            >
              <Text className="text-[14px] leading-5 font-bold text-m3-on-primary">
                Let&apos;s Get Started
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={ICON_COLORS.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom bar */}
        <View className="flex-row items-center justify-between pb-2 z-10">
          <OnboardingDots step={1} total={3} label="Step 1 of 3" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingIntroScreen;
