import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { LogOut, User, Shield, ChevronRight, CheckCircle2, TrendingUp, LocateFixed } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { useAuthStore } from '../../../shared/store/authStore';
import { FormInput } from '../../../shared/ui/FormInput';
import { Button } from '../../../shared/ui/Button';
import { collectorService } from '../../../features/collector/collectorService';
import { citizenService } from '../../../features/citizen/citizenService';
import { authService } from '../../../features/auth/authService';

export default function CollectorProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, clearSession, setSession } = useAuthStore();
    const collectorId = user?.userId;
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [form, setForm] = useState({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        phone: user?.phone ?? '',
        vehicleType: '',
        vehiclePlate: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const { data: profile } = useQuery({
        queryKey: ['collector-profile', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getCollectorProfile(collectorId!),
    });

    const { data: stats } = useQuery({
        queryKey: ['collector-performance-profile', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getPerformanceSummary(collectorId!),
    });

    const { data: dailyKpi } = useQuery({
        queryKey: ['collector-kpi-today', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getDailyKpi(collectorId!, new Date().toISOString().slice(0, 10)),
    });

    React.useEffect(() => {
        if (!profile) return;
        setForm((prev) => ({
            ...prev,
            firstName: user?.firstName ?? prev.firstName,
            lastName: user?.lastName ?? prev.lastName,
            phone: profile.phone ?? '',
            vehicleType: profile.vehicleType ?? '',
            vehiclePlate: profile.vehiclePlate ?? '',
        }));
    }, [profile, user?.firstName, user?.lastName]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!collectorId) {
                throw new Error('Missing collector id');
            }
            const [updatedUser, updatedCollector] = await Promise.all([
                citizenService.updateUser(collectorId, {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                }),
                collectorService.updateCollectorProfile(collectorId, {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    vehicleType: form.vehicleType,
                    vehiclePlate: form.vehiclePlate,
                }),
            ]);
            return { updatedUser, updatedCollector };
        },
        onSuccess: ({ updatedUser }) => {
            const state = useAuthStore.getState();
            if (state.accessToken && state.refreshToken && state.user) {
                setSession({
                    user: {
                        ...state.user,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        phone: updatedUser.phone,
                        avatarUrl: updatedUser.avatarUrl,
                    },
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['collector-profile'] });
            setEditing(false);
            Alert.alert('Thành công', 'Đã cập nhật hồ sơ collector.');
        },
        onError: (err: any) =>
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật thông tin.'),
    });

    const availabilityMutation = useMutation({
        mutationFn: (isAvailable: boolean) => collectorService.setAvailability(collectorId!, isAvailable),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collector-profile'] }),
        onError: (err: any) =>
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật trạng thái sẵn sàng.'),
    });

    const locationMutation = useMutation({
        mutationFn: async () => {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                throw new Error('Cần quyền vị trí để cập nhật.');
            }
            const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            return collectorService.updateCollectorLocation(
                collectorId!,
                current.coords.latitude,
                current.coords.longitude
            );
        },
        onSuccess: () => Alert.alert('Thành công', 'Đã cập nhật vị trí hiện tại.'),
        onError: (err: any) => Alert.alert('Lỗi', err?.message ?? 'Không thể cập nhật vị trí.'),
    });

    const changePasswordMutation = useMutation({
        mutationFn: () =>
            citizenService.changePassword(collectorId!, {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            }),
        onSuccess: () => {
            setChangingPassword(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Thành công', 'Đã đổi mật khẩu.');
        },
        onError: (err: any) =>
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể đổi mật khẩu.'),
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
            Alert.alert('Thiếu dữ liệu', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            Alert.alert('Mật khẩu yếu', 'Mật khẩu mới cần ít nhất 8 ký tự.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            Alert.alert('Không khớp', 'Xác nhận mật khẩu chưa đúng.');
            return;
        }
        changePasswordMutation.mutate();
    };

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
                    <Text style={styles.roleBadgeText}>Nhân viên thu gom</Text>
                </View>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <GlassCard style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>Hiệu suất hôm nay</Text>
                    <View style={styles.kpiRow}>
                        {[
                            {
                                label: 'Đã hoàn thành',
                                value: stats?.totalJobsCompleted ?? 0,
                                icon: <CheckCircle2 size={18} color="#059669" />,
                            },
                            {
                                label: 'Tỉ lệ đạt',
                                value: `${Math.round(stats?.completionRate ?? 0)}%`,
                                icon: <TrendingUp size={18} color="#3b82f6" />,
                            },
                        ].map((k) => (
                            <View key={k.label} style={styles.kpiItem}>
                                {k.icon}
                                <Text style={styles.kpiValue}>{k.value}</Text>
                                <Text style={styles.kpiLabel}>{k.label}</Text>
                            </View>
                        ))}
                    </View>
                    {dailyKpi ? (
                        <Text style={styles.kpiHint}>
                            KPI ngày: {dailyKpi.actualVisits}/{dailyKpi.minVisits} lượt •{' '}
                            {dailyKpi.actualWeightKg}/{dailyKpi.minWeightKg} kg ({dailyKpi.status})
                        </Text>
                    ) : (
                        <Text style={styles.kpiHint}>Chưa có KPI cấu hình cho hôm nay.</Text>
                    )}
                </GlassCard>

                <GlassCard style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuRow} onPress={() => setEditing((v) => !v)}>
                        <View style={styles.menuIconWrap}>
                            <User size={18} color="#059669" />
                        </View>
                        <Text style={styles.menuLabel}>Cập nhật hồ sơ collector</Text>
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

                <GlassCard style={styles.actionCard}>
                    <Button
                        title={profile?.isAvailable ? 'Đang sẵn sàng - Nhấn để tạm nghỉ' : 'Đang tạm nghỉ - Nhấn để sẵn sàng'}
                        variant={profile?.isAvailable ? 'secondary' : 'outline'}
                        onPress={() => availabilityMutation.mutate(!profile?.isAvailable)}
                        loading={availabilityMutation.isPending}
                    />
                    <Button
                        title="Cập nhật vị trí hiện tại"
                        variant="outline"
                        icon={<LocateFixed size={16} color="#059669" />}
                        onPress={() => locationMutation.mutate()}
                        loading={locationMutation.isPending}
                        style={{ marginTop: 8 }}
                    />
                </GlassCard>

                {editing ? (
                    <GlassCard style={styles.formCard}>
                        <Text style={styles.cardTitle}>Thông tin collector</Text>
                        <FormInput
                            label="Họ"
                            value={form.firstName}
                            onChangeText={(text) => setForm((prev) => ({ ...prev, firstName: text }))}
                        />
                        <FormInput
                            label="Tên"
                            value={form.lastName}
                            onChangeText={(text) => setForm((prev) => ({ ...prev, lastName: text }))}
                        />
                        <FormInput
                            label="Số điện thoại"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                        />
                        <FormInput
                            label="Loại xe"
                            value={form.vehicleType}
                            onChangeText={(text) => setForm((prev) => ({ ...prev, vehicleType: text }))}
                        />
                        <FormInput
                            label="Biển số xe"
                            value={form.vehiclePlate}
                            onChangeText={(text) => setForm((prev) => ({ ...prev, vehiclePlate: text }))}
                        />
                        <Button
                            title="Lưu thay đổi"
                            loading={updateMutation.isPending}
                            onPress={() => updateMutation.mutate()}
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
    roleBadge: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
    roleBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    kpiCard: { padding: 20, marginBottom: 16 },
    kpiTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 14 },
    kpiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
    kpiItem: { alignItems: 'center', gap: 6 },
    kpiValue: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    kpiLabel: { fontSize: 12, color: '#94a3b8' },
    kpiHint: { fontSize: 12, color: '#64748b' },
    menuCard: { padding: 0, overflow: 'hidden', marginBottom: 16 },
    menuRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
    menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    menuDivider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 18 },
    actionCard: { marginBottom: 16 },
    formCard: { marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
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

