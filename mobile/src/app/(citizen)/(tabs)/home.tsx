import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, MapPin, TrendingUp, Leaf, ChevronRight, CirclePlus, MessagesSquare } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { useAuthStore } from '../../../shared/store/authStore';
import { citizenService } from '../../../features/citizen/citizenService';
import { rewardService } from '../../../features/reward/rewardService';
import { WasteReport } from '../../../shared/types/domain';

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ duyệt', color: '#f59e0b' },
    APPROVED: { label: 'Đã duyệt', color: '#3b82f6' },
    ASSIGNED_TO_TASK: { label: 'Đã tạo task', color: '#7c3aed' },
    ASSIGNED: { label: 'Đã giao collector', color: '#8b5cf6' },
    IN_PROGRESS: { label: 'Đang thu gom', color: '#2563eb' },
    COMPLETED: { label: 'Đã hoàn thành', color: '#059669' },
    REJECTED: { label: 'Bị từ chối', color: '#dc2626' },
    CANCELLED: { label: 'Đã hủy', color: '#64748b' },
};

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] ?? { label: status, color: '#64748b' };
    return (
        <View style={[styles.badge, { backgroundColor: `${style.color}22` }]}>
            <View style={[styles.badgeDot, { backgroundColor: style.color }]} />
            <Text style={[styles.badgeText, { color: style.color }]}>{style.label}</Text>
        </View>
    );
}

function SkeletonCard() {
    return (
        <GlassCard style={styles.reportCard}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
        </GlassCard>
    );
}

export default function CitizenHomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const { data: reportPage, isLoading: reportsLoading } = useQuery({
        queryKey: ['citizen-reports-home', user?.userId],
        enabled: Boolean(user?.userId),
        queryFn: () => citizenService.getMyWasteReports({ page: 0, size: 20 }),
    });

    const reports = reportPage?.content ?? [];
    const recentReports = reports.slice(0, 5);

    const { data: profile } = useQuery({
        queryKey: ['citizen-profile-home', user?.userId],
        enabled: Boolean(user?.userId),
        queryFn: () => citizenService.getCitizenProfile(user!.userId),
    });

    const { data: totalPoints = 0 } = useQuery({
        queryKey: ['citizen-points-home'],
        queryFn: rewardService.getMyPoints,
    });

    const stats = React.useMemo(() => {
        const totalReports = reports.length;
        const completedCount = reports.filter((x) => x.status === 'COMPLETED').length;
        const pendingCount = reports.filter((x) => x.status === 'PENDING').length;
        const inProgressCount = reports.filter((x) =>
            ['ASSIGNED', 'ASSIGNED_TO_TASK', 'IN_PROGRESS'].includes(x.status)
        ).length;
        return { totalReports, completedCount, pendingCount, inProgressCount };
    }, [reports]);

    const renderReport = React.useCallback(
        ({ item }: { item: WasteReport }) => (
            <GlassCard style={styles.reportCard}>
                <View style={styles.reportRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.reportType}>Báo cáo #{item.reportId.slice(-6)}</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={12} color="#94a3b8" />
                            <Text style={styles.reportLocation} numberOfLines={1}>
                                {item.areaName || item.addressText || 'Chưa có địa chỉ'}
                            </Text>
                        </View>
                        <Text style={styles.reportDate}>
                            {item.createdAt
                                ? new Date(item.createdAt).toLocaleString('vi-VN')
                                : 'Không có thời gian'}
                        </Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>
            </GlassCard>
        ),
        []
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>
                        {user?.firstName} {user?.lastName} 👋
                    </Text>
                    {profile?.defaultAreaName ? (
                        <Text style={styles.areaText}>Khu vực: {profile.defaultAreaName}</Text>
                    ) : null}
                </View>
                <TouchableOpacity style={styles.bellBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Bell color="#ffffff" size={22} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <GlassCard elevated style={styles.pointsCard}>
                    <View style={styles.pointsRow}>
                        <View>
                            <Text style={styles.pointsLabel}>Điểm tích lũy</Text>
                            <Text style={styles.pointsValue}>{totalPoints}</Text>
                            <Text style={styles.pointsRank}>Tổng báo cáo: {stats.totalReports}</Text>
                        </View>
                        <View style={styles.leafCircle}>
                            <Leaf color="#059669" size={36} />
                        </View>
                    </View>
                </GlassCard>

                <View style={styles.statsRow}>
                    {[
                        { label: 'Đang chờ', value: stats.pendingCount, color: '#f59e0b' },
                        { label: 'Đang xử lý', value: stats.inProgressCount, color: '#2563eb' },
                        { label: 'Hoàn thành', value: stats.completedCount, color: '#059669' },
                    ].map((s) => (
                        <GlassCard key={s.label} style={styles.statCard}>
                            <TrendingUp size={18} color={s.color} />
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </GlassCard>
                    ))}
                </View>

                <View style={styles.quickActionRow}>
                    <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(citizen)/(tabs)/report')}>
                        <CirclePlus size={18} color="#059669" />
                        <Text style={styles.quickActionText}>Tạo báo cáo mới</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(citizen)/(tabs)/profile')}>
                        <MessagesSquare size={18} color="#059669" />
                        <Text style={styles.quickActionText}>Gửi khiếu nại</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Báo cáo gần đây</Text>
                    <TouchableOpacity onPress={() => router.push('/(citizen)/(tabs)/report')}>
                        <View style={styles.seeAllRow}>
                            <Text style={styles.seeAll}>Xem tab báo cáo</Text>
                            <ChevronRight size={16} color="#059669" />
                        </View>
                    </TouchableOpacity>
                </View>

                {reportsLoading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : recentReports.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Leaf size={40} color="#d1fae5" />
                        <Text style={styles.emptyText}>Chưa có báo cáo nào. Hãy tạo báo cáo đầu tiên của bạn.</Text>
                    </GlassCard>
                ) : (
                    <FlatList
                        data={recentReports}
                        keyExtractor={(item) => item.reportId}
                        renderItem={renderReport}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
    userName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 2 },
    areaText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: 16, paddingBottom: 32 },
    pointsCard: { marginBottom: 16, padding: 20 },
    pointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pointsLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
    pointsValue: { fontSize: 38, fontWeight: '800', color: '#047857' },
    pointsRank: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    leafCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, alignItems: 'center', padding: 14, gap: 6 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    statLabel: { fontSize: 11, color: '#94a3b8' },
    quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    quickActionBtn: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#d1fae5',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    quickActionText: { color: '#047857', fontWeight: '600', fontSize: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    seeAllRow: { flexDirection: 'row', alignItems: 'center' },
    seeAll: { fontSize: 13, color: '#059669', fontWeight: '600' },
    reportCard: { marginBottom: 10, padding: 14 },
    reportRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    reportType: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    reportLocation: { fontSize: 12, color: '#94a3b8', flex: 1 },
    reportDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    badgeDot: { width: 7, height: 7, borderRadius: 4 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    emptyCard: { alignItems: 'center', padding: 30, gap: 12 },
    emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, lineHeight: 22 },
    skeletonTitle: { height: 16, width: '60%', backgroundColor: '#e2e8f0', borderRadius: 8, marginBottom: 8 },
    skeletonSubtitle: { height: 12, width: '40%', backgroundColor: '#f1f5f9', borderRadius: 6 },
});

