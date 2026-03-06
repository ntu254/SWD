import { Tabs } from 'expo-router';
import { Home, Camera, Star, User, MessageSquare } from 'lucide-react-native';

export default function CitizenTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#059669',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: 64,
                    paddingBottom: 10,
                    paddingTop: 8,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 20,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="report"
                options={{ title: 'Báo cáo rác', tabBarIcon: ({ color }) => <Camera size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="rewards"
                options={{ title: 'Phần thưởng', tabBarIcon: ({ color }) => <Star size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="support"
                options={{ title: 'Hỗ trợ AI', tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
            />
        </Tabs>
    );
}
