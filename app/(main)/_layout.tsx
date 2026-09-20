import { colors } from '@/src/constants';
import { home_tab_items } from '@/src/constants/data';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const _layout = () => {
  type TabIconProps = {
    focused: boolean;
    icon: string;
  };

  // Tab Icon
  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={`tabs-pill ${focused && 'tabs-active'}`}>
          <Image
            source={icon}
            resizeMode="contain"
            className="aspect-square h-4 w-4"
          />
        </View>
      </View>
    );
  };

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
