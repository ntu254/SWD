import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, Shield, Globe, Moon, ChevronRight,
  Smartphone, Mail, LogOut
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function EnterpriseSettingsScreen() {
  const { logout } = useAppStore();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  type SettingItem = {
    icon: typeof Shield;
    label: string;
    value?: string | boolean;
    isSwitch?: boolean;
    onPress?: () => void;
    onToggle?: (value: boolean) => void;
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Tài khoản',
      items: [
        { icon: Shield, label: 'Bảo mật', onPress: () => {} },
        { icon: Globe, label: 'Ngôn ngữ', value: 'Tiếng Việt', onPress: () => {} },
      ],
    },
    {
      title: 'Thông báo',
      items: [
        { icon: Bell, label: 'Thông báo', isSwitch: true, value: notifications, onToggle: setNotifications },
        { icon: Mail, label: 'Email', isSwitch: true, value: true, onToggle: () => {} },
        { icon: Smartphone, label: 'SMS', isSwitch: true, value: false, onToggle: () => {} },
      ],
    },
    {
      title: 'Hiển thị',
      items: [
        { icon: Moon, label: 'Chế độ tối', isSwitch: true, value: darkMode, onToggle: setDarkMode },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.subtitle}>Tùy chỉnh ứng dụng</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <View key={itemIndex} style={styles.settingItem}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.accent[50] }]}>
                    <Icon size={20} color={Colors.accent[600]} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.isSwitch ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.neutral[300], true: Colors.accent[500] }}
                    />
                  ) : (
                    <TouchableOpacity style={styles.valueContainer} onPress={item.onPress}>
                      <Text style={styles.settingValue}>{item.value}</Text>
                      <ChevronRight size={20} color={Colors.neutral[400]} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EcoCollect Enterprise v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.status.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.neutral[400],
    marginTop: 24,
  },
});
