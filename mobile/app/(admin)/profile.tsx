import {
  fetchAdminDashboard,
  fetchMyProfile,
  logoutSession,
  syncRoleSession,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import type { UserRole } from '@/store/useAppStore';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Bell,
  ChevronRight,
  MessageSquareWarning,
  Gift,
  LogOut,
  Settings,
  Shield,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

const ADMIN_COLOR = Colors.status.error;

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Người dùng',
  COLLECTOR: 'Collector',
  ENTERPRISE: 'Doanh nghiệp',
  ADMIN: 'Admin',
};

const roleColors: Record<UserRole, string> = {
  CITIZEN: Colors.primary[600],
  COLLECTOR: Colors.secondary[600],
  ENTERPRISE: Colors.accent[600],
  ADMIN: ADMIN_COLOR,
};

const roleOptions: UserRole[] = ['CITIZEN', 'COLLECTOR', 'ENTERPRISE', 'ADMIN'];

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, logout, accessToken, currentRole } = useAppStore();
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);

  const profileQuery = useQuery({
    queryKey: ['admin', 'profile', 'me', currentRole],
    queryFn: () => fetchMyProfile(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const dashboardQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => fetchAdminDashboard(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const profileUser = profileQuery.data ?? user;
  const dashboard = dashboardQuery.data;

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logoutSession(accessToken);
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleSwitchRole = async (role: UserRole) => {
    if (switchingRole) {
      return;
    }

    try {
      setSwitchingRole(role);
      await syncRoleSession(role);

      switch (role) {
        case 'CITIZEN':
          router.replace('/(citizen)/home');
          break;
        case 'COLLECTOR':
          router.replace('/(collector)/tasks');
          break;
        case 'ENTERPRISE':
          router.replace('/(enterprise)/dashboard');
          break;
        case 'ADMIN':
          router.replace('/(admin)/analytics');
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đồng bộ vai trò';
      Alert.alert('Lỗi chuyển vai trò', message);
    } finally {
      setSwitchingRole(null);
    }
  };

  const menuItems = [
    { icon: BarChart3, label: 'Phân tích hệ thống', onPress: () => router.push('/(admin)/analytics') },
    { icon: Users, label: 'Quản lý người dùng', onPress: () => router.push('/(admin)/users') },
    { icon: MessageSquareWarning, label: 'Quản lý khiếu nại', onPress: () => router.push('/(admin)/complaints') },
    { icon: Bell, label: 'Quản lý thông báo', onPress: () => router.push('/(admin)/notifications') },
    { icon: Gift, label: 'Quản lý reward item', onPress: () => router.push('/(admin)/reward-items') },
    { icon: Shield, label: 'Bảo mật hệ thống', onPress: () => router.push('/(admin)/settings') },
    { icon: Settings, label: 'Cài đặt quản trị', onPress: () => router.push('/(admin)/settings') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Profile</Text>
          <Text style={styles.headerSubtitle}>Trung tâm quản trị hệ thống</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: profileUser?.avatarUrl || 'https://i.pravatar.cc/150?u=admin' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profileUser?.displayName || 'Admin'}</Text>
            <Text style={styles.email}>{profileUser?.email || 'admin@example.com'}</Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleColors[(profileUser?.role || 'ADMIN') as UserRole] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: roleColors[(profileUser?.role || 'ADMIN') as UserRole] },
                ]}
              >
                {roleLabels[(profileUser?.role || 'ADMIN') as UserRole]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(dashboard?.totalUsers ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Người dùng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(dashboard?.totalReports ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Báo cáo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(dashboard?.openComplaints ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Khiếu nại</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuyển vai trò (Dev)</Text>
          <View style={styles.roleSwitcher}>
            {roleOptions.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  currentRole === role && { backgroundColor: roleColors[role] },
                ]}
                onPress={() => void handleSwitchRole(role)}
                disabled={!!switchingRole}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    currentRole === role && { color: Colors.neutral.white },
                  ]}
                >
                  {switchingRole === role ? 'Đang đồng bộ...' : roleLabels[role]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều hướng nhanh</Text>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: ADMIN_COLOR + '14' }]}>
                  <Icon size={20} color={ADMIN_COLOR} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <ChevronRight size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EcoCollect Admin v1.0.0</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    ...Shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  email: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    ...Shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  roleSwitcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    gap: 8,
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
    marginTop: 16,
    marginBottom: 24,
  },
});
