import { Stack } from 'expo-router';

const OnboardingLayout = () => {
  return (
    <Stack
      initialRouteName="intro"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#fbf9f6' },
      }}
    />
  );
};

export default OnboardingLayout;
