import { Tabs } from 'expo-router';
import { ListTodo, Map, Clock, User } from 'lucide-react-native';

export default function CollectorTabsLayout() {
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
                name="tasks"
                options={{ title: 'Công việc', tabBarIcon: ({ color }) => <ListTodo size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="map"
                options={{ title: 'Bản đồ', tabBarIcon: ({ color }) => <Map size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="history"
                options={{ title: 'Lịch sử', tabBarIcon: ({ color }) => <Clock size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
            />
        </Tabs>
    );
}
