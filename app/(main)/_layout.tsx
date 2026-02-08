import { colors } from '@/src/constants';
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
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(library)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
