import Header from '@/src/components/Header';
import { m3 } from '@/src/constants';
import { home_tab_items } from '@/src/constants/data';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const _layout = () => {
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
          backgroundColor: m3['surface-low'],
          borderRadius: 50,
          marginHorizontal: 24,
          marginBottom: 24,
          position: 'absolute',
          width: '70%',
          transformOrigin: 'center',
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
                  borderRadius: 999,
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

export default _layout;
