import { colors } from '@/constants/constants';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Tabs 
     screenOptions={{
        headerShown: false,
        tabBarLabelPosition:'beside-icon',
        tabBarShowLabel:false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.light,
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",  
        },
        tabBarStyle: {
          backgroundColor: colors.dark,
          borderRadius: 50,
          marginHorizontal: 16,
          marginBottom: 16,
          position: "absolute"
        }

      }}
    >
        <Tabs.Screen name='index' options={{
          tabBarIcon: ({color, size}) => (<Feather name="home" size={size} color={color} />),         
        }}/>
        <Tabs.Screen name='library' options={{
          tabBarIcon: ({color, size}) => (<Feather name="book-open" size={size} color={color} />)
        }}/>
        <Tabs.Screen name='bookmarks' options={{
          tabBarIcon: ({color, size}) => (<Feather name="bookmark" size={size} color={color} />)
        }}/>
        <Tabs.Screen name='profile' 
        options={{
          tabBarIcon: ({color, size}) => (<Feather name="user" size={size} color={color} />)
        }}/>
    </Tabs>
  )
}

export default _layout