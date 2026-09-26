import { View } from 'react-native';

interface OnboardingDotsProps {
  step: number;
  total: number;
  label?: string;
}

const OnboardingDots = ({ step, total, label }: OnboardingDotsProps) => {
  return (
    <View
      className="flex-row items-center gap-1.5"
      accessible={label !== undefined}
      accessibilityLabel={label}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === step - 1;
        return (
          <View
            key={`dot-${index + 1}`}
            className={`h-2 rounded-full ${
              isActive ? 'w-6 bg-m3-primary' : 'w-2 bg-m3-outline-variant/60'
            }`}
          />
        );
      })}
    </View>
  );
};

export default OnboardingDots;
