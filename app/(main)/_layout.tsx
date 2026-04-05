import { colors } from '@/src/constants';
import { home_tab_items } from '@/src/constants/data';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.graphite[100],
        tabBarInactiveTintColor: colors.graphite[700],
        tabBarItemStyle: {
          marginTop: 10,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: {
          backgroundColor: colors.graphite[800],
          borderRadius: 50,
          marginHorizontal: 24,
          marginBottom: 24,
          position: 'absolute',
          paddingVertical: 10,
          width: '60%',
          transform: [{ translateX: '25%' }],
          // left: '50%',
          height: 60, // Ensures proper vertical alignment
        },
      }}
    >
      {home_tab_items.map(item => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name={item.iconName as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default _layout;
