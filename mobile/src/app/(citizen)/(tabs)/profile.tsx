import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Alert,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, User, Shield, ChevronRight, Star, Leaf } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { Button } from '../../../shared/ui/Button';
import { FormInput } from '../../../shared/ui/FormInput';
import { useAuthStore } from '../../../shared/store/authStore';
import { citizenService } from '../../../features/citizen/citizenService';
import { rewardService } from '../../../features/reward/rewardService';
import { complaintService } from '../../../features/complaint/complaintService';
import { authService } from '../../../features/auth/authService';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../../shared/types/domain';

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
    'COLLECTION_ISSUE',
    'SERVICE_ISSUE',
    'POINTS_ERROR',
    'BUG',
    'OTHER',
];
const COMPLAINT_PRIORITIES: ComplaintPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

const STATUS_COLORS: Record<ComplaintStatus, string> = {
    Pending: '#f59e0b',
    In_Progress: '#3b82f6',
    Resolved: '#059669',
    Rejected: '#dc2626',
};

export default function ProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, clearSession, setSession } = useAuthStore();
    const userId = user?.userId;

    const [editingProfile, setEditingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);

    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        phone: user?.phone ?? '',
        addressText: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [complaintForm, setComplaintForm] = useState({
        title: '',
        content: '',
        category: 'SERVICE_ISSUE' as ComplaintCategory,
        priority: 'Normal' as ComplaintPriority,
    });

    const { data: points = 0 } = useQuery({
        queryKey: ['citizen-points-profile'],
        queryFn: rewardService.getMyPoints,
    });

    const { data: profile } = useQuery({
        queryKey: ['citizen-profile', userId],
        enabled: Boolean(userId),
        queryFn: () => citizenService.getCitizenProfile(userId!),
    });

    const { data: complaintsPage } = useQuery({
        queryKey: ['citizen-complaints', userId],
        enabled: Boolean(userId),
        queryFn: () => complaintService.getCitizenComplaints(userId!, { page: 0, size: 10 }),
    });

    const complaints = complaintsPage?.content ?? [];

    React.useEffect(() => {
        if (!profile) return;
        setProfileForm((prev) => ({
            ...prev,
            firstName: user?.firstName ?? prev.firstName,
            lastName: user?.lastName ?? prev.lastName,
            phone: profile.phone ?? '',
            addressText: profile.addressText ?? '',
        }));
    }, [profile, user?.firstName, user?.lastName]);

    const updateProfileMutation = useMutation({
        mutationFn: async () => {
            if (!userId) {
                throw new Error('Missing user ID');
            }
            const [updatedUser, updatedProfile] = await Promise.all([
                citizenService.updateUser(userId, {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    phone: profileForm.phone,
                }),
                citizenService.updateCitizenProfile(userId, {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    phone: profileForm.phone,
                    addressText: profileForm.addressText,
                }),
            ]);
            return { updatedUser, updatedProfile };
        },
        onSuccess: ({ updatedUser }) => {
            if (user && useAuthStore.getState().accessToken && useAuthStore.getState().refreshToken) {
                setSession({
                    user: {
                        ...user,
                        userId: updatedUser.userId,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        phone: updatedUser.phone,
                        avatarUrl: updatedUser.avatarUrl,
                    },
                    accessToken: useAuthStore.getState().accessToken!,
                    refreshToken: useAuthStore.getState().refreshToken!,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['citizen-profile'] });
            setEditingProfile(false);
            Alert.alert('Thành công', 'Đã cập nhật hồ sơ.');
        },
        onError: (err: any) => {
            Alert.alert('Lỗi cập nhật', err?.response?.data?.message ?? 'Không thể cập nhật hồ sơ.');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async () => {
            if (!userId) {
                throw new Error('Missing user ID');
            }
            await citizenService.changePassword(userId, {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
        },
        onSuccess: () => {
            setChangingPassword(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Thành công', 'Đã đổi mật khẩu.');
        },
        onError: (err: any) => {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể đổi mật khẩu.');
        },
    });

    const createComplaintMutation = useMutation({
        mutationFn: async () => {
            if (!userId) {
                throw new Error('Missing user ID');
            }
            return complaintService.createComplaint(userId, complaintForm);
        },
        onSuccess: () => {
            setComplaintForm({
                title: '',
                content: '',
                category: 'SERVICE_ISSUE',
                priority: 'Normal',
            });
            setShowComplaintForm(false);
            queryClient.invalidateQueries({ queryKey: ['citizen-complaints'] });
            Alert.alert('Đã gửi', 'Khiếu nại của bạn đã được ghi nhận.');
        },
        onError: (err: any) => {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể gửi khiếu nại.');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSettled: () => {
            clearSession();
            router.replace('/(auth)/login');
        },
    });

    const handleChangePassword = () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            Alert.alert('Thiếu dữ liệu', 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            Alert.alert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            Alert.alert('Không khớp', 'Xác nhận mật khẩu chưa đúng.');
            return;
        }
        changePasswordMutation.mutate();
    };

    const roleName = 'Người dân';
    const resolvedComplaints = useMemo(
        () => complaints.filter((item) => item.status === 'Resolved').length,
        [complaints]
    );

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: () => logoutMutation.mutate(),
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {(user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {user?.firstName} {user?.lastName}
                </Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{roleName}</Text>
                </View>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <GlassCard style={styles.statsRow}>
                    {[
                        { label: 'Điểm', value: points, icon: <Star size={16} color="#f59e0b" fill="#f59e0b" /> },
                        { label: 'Khiếu nại', value: complaints.length, icon: <Leaf size={16} color="#059669" /> },
                        { label: 'Đã xử lý', value: resolvedComplaints, icon: <Leaf size={16} color="#2563eb" /> },
                    ].map((s) => (
                        <View key={s.label} style={styles.statItem}>
                            {s.icon}
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </GlassCard>

                <GlassCard style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuRow} onPress={() => setEditingProfile((v) => !v)}>
                        <View style={styles.menuIconWrap}>
                            <User size={18} color="#059669" />
                        </View>
                        <Text style={styles.menuLabel}>Cập nhật thông tin cá nhân</Text>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity style={styles.menuRow} onPress={() => setChangingPassword((v) => !v)}>
                        <View style={styles.menuIconWrap}>
                            <Shield size={18} color="#3b82f6" />
                        </View>
                        <Text style={styles.menuLabel}>Đổi mật khẩu</Text>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                </GlassCard>

                {editingProfile ? (
                    <GlassCard style={styles.formCard}>
                        <Text style={styles.cardTitle}>Cập nhật hồ sơ</Text>
                        <FormInput
                            label="Họ"
                            value={profileForm.firstName}
                            onChangeText={(text) => setProfileForm((prev) => ({ ...prev, firstName: text }))}
                        />
                        <FormInput
                            label="Tên"
                            value={profileForm.lastName}
                            onChangeText={(text) => setProfileForm((prev) => ({ ...prev, lastName: text }))}
                        />
                        <FormInput
                            label="Số điện thoại"
                            keyboardType="phone-pad"
                            value={profileForm.phone}
                            onChangeText={(text) => setProfileForm((prev) => ({ ...prev, phone: text }))}
                        />
                        <FormInput
                            label="Địa chỉ"
                            value={profileForm.addressText}
                            onChangeText={(text) => setProfileForm((prev) => ({ ...prev, addressText: text }))}
                        />
                        <Button
                            title="Lưu thay đổi"
                            loading={updateProfileMutation.isPending}
                            onPress={() => updateProfileMutation.mutate()}
                        />
                    </GlassCard>
                ) : null}

                {changingPassword ? (
                    <GlassCard style={styles.formCard}>
                        <Text style={styles.cardTitle}>Đổi mật khẩu</Text>
                        <FormInput
                            label="Mật khẩu cũ"
                            secureTextEntry
                            value={passwordForm.oldPassword}
                            onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, oldPassword: text }))}
                        />
                        <FormInput
                            label="Mật khẩu mới"
                            secureTextEntry
                            value={passwordForm.newPassword}
                            onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, newPassword: text }))}
                        />
                        <FormInput
                            label="Xác nhận mật khẩu mới"
                            secureTextEntry
                            value={passwordForm.confirmPassword}
                            onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, confirmPassword: text }))}
                        />
                        <Button
                            title="Cập nhật mật khẩu"
                            loading={changePasswordMutation.isPending}
                            onPress={handleChangePassword}
                        />
                    </GlassCard>
                ) : null}

                <View style={styles.complaintHeader}>
                    <Text style={styles.complaintTitle}>Khiếu nại của tôi</Text>
                    <TouchableOpacity onPress={() => setShowComplaintForm((v) => !v)}>
                        <Text style={styles.addComplaintText}>{showComplaintForm ? 'Đóng' : 'Tạo khiếu nại'}</Text>
                    </TouchableOpacity>
                </View>

                {showComplaintForm ? (
                    <GlassCard style={styles.formCard}>
                        <FormInput
                            label="Tiêu đề"
                            value={complaintForm.title}
                            onChangeText={(text) => setComplaintForm((prev) => ({ ...prev, title: text }))}
                        />
                        <FormInput
                            label="Nội dung"
                            multiline
                            numberOfLines={4}
                            value={complaintForm.content}
                            onChangeText={(text) => setComplaintForm((prev) => ({ ...prev, content: text }))}
                            style={{ height: 100, textAlignVertical: 'top' }}
                        />
                        <Text style={styles.fieldLabel}>Danh mục</Text>
                        <View style={styles.pillRow}>
                            {COMPLAINT_CATEGORIES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.pill,
                                        complaintForm.category === item && styles.pillActive,
                                    ]}
                                    onPress={() => setComplaintForm((prev) => ({ ...prev, category: item }))}
                                >
                                    <Text
                                        style={[
                                            styles.pillText,
                                            complaintForm.category === item && styles.pillTextActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.fieldLabel}>Mức ưu tiên</Text>
                        <View style={styles.pillRow}>
                            {COMPLAINT_PRIORITIES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.pill,
                                        complaintForm.priority === item && styles.pillActive,
                                    ]}
                                    onPress={() => setComplaintForm((prev) => ({ ...prev, priority: item }))}
                                >
                                    <Text
                                        style={[
                                            styles.pillText,
                                            complaintForm.priority === item && styles.pillTextActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Button
                            title="Gửi khiếu nại"
                            loading={createComplaintMutation.isPending}
                            onPress={() => {
                                if (!complaintForm.title.trim() || !complaintForm.content.trim()) {
                                    Alert.alert('Thiếu dữ liệu', 'Vui lòng nhập tiêu đề và nội dung.');
                                    return;
                                }
                                createComplaintMutation.mutate();
                            }}
                        />
                    </GlassCard>
                ) : null}

                <GlassCard style={styles.complaintCard}>
                    {complaints.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có khiếu nại nào.</Text>
                    ) : (
                        <FlatList
                            data={complaints}
                            scrollEnabled={false}
                            keyExtractor={(item) => item.complaintId}
                            ItemSeparatorComponent={() => <View style={styles.menuDivider} />}
                            renderItem={({ item }) => (
                                <View style={styles.complaintRow}>
                                    <View style={styles.complaintHeaderRow}>
                                        <Text style={styles.complaintRowTitle}>{item.title}</Text>
                                        <View
                                            style={[
                                                styles.complaintStatusBadge,
                                                { backgroundColor: `${STATUS_COLORS[item.status]}22` },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.complaintStatusText,
                                                    { color: STATUS_COLORS[item.status] },
                                                ]}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.complaintContent} numberOfLines={2}>
                                        {item.content}
                                    </Text>
                                    <Text style={styles.complaintMeta}>
                                        {item.priority} • {item.category}
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </GlassCard>

                <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    avatarCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
    userName: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    roleBadge: {
        marginTop: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, padding: 20 },
    statItem: { alignItems: 'center', gap: 6 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    statLabel: { fontSize: 11, color: '#94a3b8' },
    menuCard: { padding: 0, overflow: 'hidden', marginBottom: 16 },
    menuRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
    menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    menuDivider: { height: 1, backgroundColor: '#f1f5f9' },
    formCard: { marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    complaintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    complaintTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    addComplaintText: { color: '#059669', fontWeight: '700' },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    pill: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#fff',
    },
    pillActive: {
        borderColor: '#059669',
        backgroundColor: '#ecfdf5',
    },
    pillText: { fontSize: 12, color: '#64748b' },
    pillTextActive: { color: '#059669', fontWeight: '700' },
    complaintCard: { marginBottom: 16, padding: 0, overflow: 'hidden' },
    complaintRow: { paddingHorizontal: 14, paddingVertical: 12 },
    complaintHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    complaintRowTitle: { flex: 1, color: '#1e293b', fontWeight: '700', marginRight: 8 },
    complaintStatusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
    complaintStatusText: { fontSize: 11, fontWeight: '700' },
    complaintContent: { color: '#64748b', fontSize: 13, marginTop: 6 },
    complaintMeta: { color: '#94a3b8', fontSize: 11, marginTop: 6 },
    emptyText: { textAlign: 'center', padding: 18, color: '#94a3b8' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#fecaca',
    },
    logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
});

