import { Tabs } from 'expo-router';
import React from 'react';
import {
  BarChart3,
  ClipboardList,
  User,
  Users,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function EnterpriseTabLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: Colors.accent[700],
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
        name="dashboard"
        options={{
          title: 'Yêu cầu',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collectors"
        options={{
          title: 'Collector',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Báo cáo',
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Cài đặt',
        }}
      />
      <Tabs.Screen
        name="capacity"
        options={{
          href: null,
          title: 'Năng lực',
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
        name="rewards"
        options={{
          href: null,
          title: 'Thưởng',
        }}
      />
    </Tabs>
  );
}
