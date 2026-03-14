import { Tabs } from 'expo-router';
import React from 'react';
import { BarChart3, User, Users } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const ADMIN_COLOR = Colors.status.error;

export default function AdminTabLayout() {
  return (
    <Tabs
      initialRouteName="analytics"
      screenOptions={{
        tabBarActiveTintColor: ADMIN_COLOR,
        tabBarInactiveTintColor: Colors.neutral[400],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Phân tích',
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Người dùng',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="complaints"
        options={{
          href: null,
          title: 'Khiếu nại',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Thông báo',
        }}
      />
      <Tabs.Screen
        name="reward-items"
        options={{
          href: null,
          title: 'Reward items',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
