import { m3 } from '@/src/constants';
import { home_tab_items } from '@/src/constants/data';
import { useOnboardingStore } from '@/src/store';
import Feather from '@expo/vector-icons/Feather';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

const MainLayout = () => {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore(
    state => state.hasCompletedOnboarding
  );

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 50,
          // position: 'absolute',
          // left: '15%',
          // right: '15%',
          width: '70%',
          alignSelf: 'center',
          bottom: 24,
          height: 64,
          paddingHorizontal: 8,
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 6,
        },
      }}
    >
      {home_tab_items.map(item => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 4,
                  borderRadius: 99,
                  backgroundColor: focused
                    ? m3['secondary-container']
                    : 'transparent',
                }}
              >
                <Feather
                  name={item.iconName}
                  size={18}
                  color={focused ? m3.primary : m3['on-surface-variant']}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default MainLayout;
