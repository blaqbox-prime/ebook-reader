import { Stack } from 'expo-router';

const OnboardingLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#fbf9f6' },
      }}
    />
  );
};

export default OnboardingLayout;
