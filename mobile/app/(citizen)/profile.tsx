import { Colors } from "@/constants/colors";
import { Shadows } from '@/constants/shadows';
import { leaderboard } from "@/data/mockData";
import type { UserRole } from "@/store/useAppStore";
import { mockUsers, useAppStore } from "@/store/useAppStore";
import { useRouter } from "expo-router";
import {
  Award,
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  Star,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const roleLabels: Record<UserRole, string> = {
  CITIZEN: "NgườI dùng",
  COLLECTOR: "Collector",
  ENTERPRISE: "Doanh nghiệp",
  ADMIN: "Quản trị viên",
};

const roleColors: Record<UserRole, string> = {
  CITIZEN: Colors.primary[600],
  COLLECTOR: Colors.secondary[600],
  ENTERPRISE: Colors.accent[600],
  ADMIN: "#E91E63",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, switchRole, points } = useAppStore();

  const myRank =
    leaderboard.findIndex((l) => l.userId === user?.userId) + 1 || 3;

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  const handleSwitchRole = (role: UserRole) => {
    switchRole(role);
    // Navigate to appropriate route group
    switch (role) {
      case "CITIZEN":
        router.replace("/(citizen)/home");
        break;
      case "COLLECTOR":
        router.replace("/(collector)/tasks");
        break;
      case "ENTERPRISE":
        router.replace("/(enterprise)/dashboard");
        break;
      case "ADMIN":
        router.replace("/(admin)/analytics");
        break;
    }
  };

  const menuItems = [
    { icon: Award, label: "Phần thưởng của tôi", onPress: () => {} },
    { icon: FileText, label: "Lịch sử điểm", onPress: () => {} },
    { icon: MapPin, label: "Khu vực hoạt động", onPress: () => {} },
    { icon: Star, label: "Đánh giá ứng dụng", onPress: () => {} },
    { icon: HelpCircle, label: "Trung tâm trợ giúp", onPress: () => {} },
    { icon: Shield, label: "Chính sách bảo mật", onPress: () => {} },
    { icon: Settings, label: "Cài đặt", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.displayName || "NgườI dùng"}</Text>
            <Text style={styles.email}>
              {user?.email || "user@example.com"}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleColors[user?.role || "CITIZEN"] + "20" },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: roleColors[user?.role || "CITIZEN"] },
                ]}
              >
                {roleLabels[user?.role || "CITIZEN"]}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(points || 9800).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Điểm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{myRank}</Text>
            <Text style={styles.statLabel}>Xếp hạng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>32</Text>
            <Text style={styles.statLabel}>Báo cáo</Text>
          </View>
        </View>

        {/* Role Switcher (Dev Only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuyển vai trò (Dev)</Text>
          <View style={styles.roleSwitcher}>
            {(Object.keys(mockUsers) as UserRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  user?.role === role && { backgroundColor: roleColors[role] },
                ]}
                onPress={() => handleSwitchRole(role)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    user?.role === role && { color: Colors.neutral.white },
                  ]}
                >
                  {roleLabels[role]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn</Text>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: Colors.primary[50] },
                  ]}
                >
                  <Icon size={20} color={Colors.primary[600]} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <ChevronRight size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EcoCollect v1.0.0</Text>
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
    fontWeight: "700",
    color: Colors.neutral[800],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: Colors.neutral[800],
  },
  email: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    ...Shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
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
    fontWeight: "600",
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  roleSwitcher: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
    color: Colors.neutral[600],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.neutral[700],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.status.error,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.neutral[400],
    marginTop: 16,
    marginBottom: 24,
  },
});
