import {
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { User, UserRole } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, MoreVertical, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ADMIN_COLOR = Colors.status.error;

const roleColors: Record<UserRole, string> = {
  CITIZEN: Colors.primary[600],
  COLLECTOR: Colors.secondary[600],
  ENTERPRISE: Colors.accent[600],
  ADMIN: ADMIN_COLOR,
};

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Người dùng',
  COLLECTOR: 'Collector',
  ENTERPRISE: 'Doanh nghiệp',
  ADMIN: 'Admin',
};

const roleFilters: (UserRole | 'ALL')[] = ['ALL', 'CITIZEN', 'COLLECTOR', 'ENTERPRISE', 'ADMIN'];

export default function AdminUsersScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UserRole | 'ALL'>('ALL');
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [sheetMode, setSheetMode] = useState<'MENU' | 'ROLE' | 'STATUS'>('MENU');

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', 'all'],
    queryFn: () => fetchAdminUsers(accessToken ?? '', { size: 200 }),
    enabled: !!accessToken,
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const invalidateAdminData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
    ]);
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) =>
      updateAdminUserRole(accessToken ?? '', userId, role),
    onSuccess: () => void invalidateAdminData(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: 'ACTIVE' | 'DISABLED' | 'BANNED';
    }) => updateAdminUserStatus(accessToken ?? '', userId, status),
    onSuccess: () => void invalidateAdminData(),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => deleteAdminUser(accessToken ?? '', userId),
    onSuccess: () => void invalidateAdminData(),
  });

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((item) => {
      const matchRole = activeFilter === 'ALL' || item.role === activeFilter;
      const matchSearch =
        query.length === 0 ||
        item.displayName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query);
      return matchRole && matchSearch;
    });
  }, [activeFilter, searchQuery, users]);

  const openActionSheet = (user: User) => {
    setActiveUser(user);
    setSheetMode('MENU');
  };

  const closeActionSheet = () => {
    setActiveUser(null);
    setSheetMode('MENU');
  };

  const onUpdateRole = async (role: UserRole) => {
    if (!activeUser) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({ userId: activeUser.userId, role });
      closeActionSheet();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật role';
      Alert.alert('Cập nhật thất bại', message);
    }
  };

  const onUpdateStatus = async (status: 'ACTIVE' | 'DISABLED' | 'BANNED') => {
    if (!activeUser) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ userId: activeUser.userId, status });
      closeActionSheet();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      Alert.alert('Cập nhật thất bại', message);
    }
  };

  const onDeleteUser = () => {
    if (!activeUser) {
      return;
    }

    Alert.alert('Xóa tài khoản', `Soft-delete ${activeUser.displayName}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserMutation.mutateAsync(activeUser.userId);
            closeActionSheet();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể xóa tài khoản';
            Alert.alert('Xóa thất bại', message);
          }
        },
      },
    ]);
  };

  const isMutating =
    updateRoleMutation.isPending || updateStatusMutation.isPending || deleteUserMutation.isPending;

  const renderUser = ({ item }: { item: (typeof users)[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image
        source={{ uri: item.avatarUrl || `https://i.pravatar.cc/150?u=${item.userId}` }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] + '20' }]}>
          <Text style={[styles.roleText, { color: roleColors[item.role] }]}>
            {roleLabels[item.role]}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreBtn} onPress={() => openActionSheet(item)}>
        <MoreVertical size={20} color={Colors.neutral[500]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý người dùng</Text>
        <Text style={styles.subtitle}>{filteredUsers.length} tài khoản</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterBtn}>
          <Filter size={20} color={Colors.neutral.white} />
        </View>
      </View>

      <View style={styles.filterRow}>
        {roleFilters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {filter === 'ALL' ? 'Tất cả' : roleLabels[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {usersQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={ADMIN_COLOR} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
              <Text style={styles.emptySub}>Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</Text>
            </View>
          }
        />
      )}

      {activeUser ? (
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={closeActionSheet} />
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>{activeUser.displayName}</Text>
            <Text style={styles.sheetSubtitle}>{activeUser.email}</Text>

            {sheetMode === 'MENU' ? (
              <>
                <TouchableOpacity style={styles.sheetAction} onPress={() => setSheetMode('ROLE')}>
                  <Text style={styles.sheetActionText}>Đổi role</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetAction} onPress={() => setSheetMode('STATUS')}>
                  <Text style={styles.sheetActionText}>Đổi trạng thái</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetAction} onPress={onDeleteUser} disabled={isMutating}>
                  <Text style={styles.sheetActionDanger}>Soft-delete</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {sheetMode === 'ROLE' ? (
              <View style={styles.optionWrap}>
                {(['CITIZEN', 'COLLECTOR', 'ENTERPRISE', 'ADMIN'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.optionChip}
                    onPress={() => void onUpdateRole(role)}
                    disabled={isMutating}
                  >
                    <Text style={styles.optionChipText}>{roleLabels[role]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {sheetMode === 'STATUS' ? (
              <View style={styles.optionWrap}>
                {(['ACTIVE', 'DISABLED', 'BANNED'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.optionChip}
                    onPress={() => void onUpdateStatus(status)}
                    disabled={isMutating}
                  >
                    <Text style={styles.optionChipText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.sheetFooter}>
              {sheetMode !== 'MENU' ? (
                <TouchableOpacity style={styles.footerBtn} onPress={() => setSheetMode('MENU')}>
                  <Text style={styles.footerBtnText}>Quay lại</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.footerBtn} onPress={closeActionSheet}>
                <Text style={styles.footerBtnText}>{isMutating ? 'Đang xử lý...' : 'Đóng'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.neutral[800],
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ADMIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: ADMIN_COLOR,
    borderColor: ADMIN_COLOR,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  email: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheetCard: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    ...Shadows.card,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  sheetSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.neutral[500],
    marginBottom: 10,
  },
  sheetAction: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  sheetActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  sheetActionDanger: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.status.error,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  footerBtn: {
    minWidth: 80,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
});
