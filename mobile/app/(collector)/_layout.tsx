import { Tabs } from 'expo-router';
import React from 'react';
import { ClipboardList, Map, BarChart3, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function CollectorTabLayout() {
  return (
    <Tabs
      initialRouteName="tasks"
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary[700],
        tabBarInactiveTintColor: Colors.neutral[400],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Nhiệm vụ',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Bản đồ',
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="kpi"
        options={{
          title: 'KPI',
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="task-detail/[taskId]"
        options={{
          href: null,
          title: 'Chi tiáº¿t nhiá»‡m vá»¥',
        }}
      />
    </Tabs>
  );
}
