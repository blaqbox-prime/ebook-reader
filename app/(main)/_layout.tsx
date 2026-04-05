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
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.graphite[800],
          borderRadius: 50,
          marginHorizontal: 24,
          marginBottom: 24,
          position: 'absolute',
          width: '70%',
          transform: [{ translateX: '15%' }],
          // left: '50%',
          height: 80, // Ensures proper vertical alignment
        },
      }}
    >
      {home_tab_items.map(item => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name={item.iconName as any} size={28} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default _layout;
