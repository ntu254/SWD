import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Timer, Activity } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { useAuthStore } from '../../../shared/store/authStore';
import { collectorService } from '../../../features/collector/collectorService';

export default function CollectorHistoryScreen() {
    const { user } = useAuthStore();
    const collectorId = user?.userId;

    const {
        data: historyPage,
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['collector-history-screen', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getJobHistory(collectorId!, { page: 0, size: 50 }),
    });

    const { data: performance } = useQuery({
        queryKey: ['collector-performance-screen', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getPerformanceSummary(collectorId!),
    });

    const history = historyPage?.content ?? [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch sử công việc</Text>
                <Text style={styles.headerSub}>Theo dõi hiệu suất thu gom của bạn</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#059669" />}
                ListHeaderComponent={
                    <View style={styles.topSection}>
                        <GlassCard style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Hiệu suất tổng quan</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statsItem}>
                                    <CheckCircle2 size={16} color="#059669" />
                                    <Text style={styles.statsValue}>{performance?.totalJobsCompleted ?? 0}</Text>
                                    <Text style={styles.statsLabel}>Hoàn thành</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Activity size={16} color="#3b82f6" />
                                    <Text style={styles.statsValue}>{Math.round(performance?.completionRate ?? 0)}%</Text>
                                    <Text style={styles.statsLabel}>Tỉ lệ đạt</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Timer size={16} color="#f59e0b" />
                                    <Text style={styles.statsValue}>
                                        {performance?.averageCompletionTimeMinutes
                                            ? Math.round(performance.averageCompletionTimeMinutes)
                                            : '--'}
                                    </Text>
                                    <Text style={styles.statsLabel}>Phút TB</Text>
                                </View>
                            </View>
                        </GlassCard>
                        <Text style={styles.listTitle}>Lịch sử nhiệm vụ</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {isLoading ? 'Đang tải dữ liệu...' : 'Chưa có lịch sử nhiệm vụ nào.'}
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <GlassCard style={styles.itemCard}>
                        <View style={styles.itemTop}>
                            <Text style={styles.itemTitle}>Task #{item.id.slice(-6)}</Text>
                            <Text style={styles.itemStatus}>{item.status}</Text>
                        </View>
                        <Text style={styles.itemSub}>Báo cáo: #{item.reportId?.slice(-6) ?? '--'}</Text>
                        <Text style={styles.itemSub}>Ghi chú: {item.note || '-'}</Text>
                        {typeof item.completionTimeMinutes === 'number' ? (
                            <Text style={styles.itemSub}>Thời gian hoàn thành: {item.completionTimeMinutes} phút</Text>
                        ) : null}
                    </GlassCard>
                )}
            />
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
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
    listContent: { padding: 16, paddingBottom: 32 },
    topSection: { marginBottom: 10 },
    statsCard: { marginBottom: 16 },
    statsTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statsItem: { flex: 1, alignItems: 'center', gap: 6 },
    statsValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    statsLabel: { fontSize: 11, color: '#94a3b8' },
    listTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    itemCard: { marginBottom: 10 },
    itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    itemTitle: { fontWeight: '700', color: '#1e293b' },
    itemStatus: { fontSize: 12, color: '#059669', fontWeight: '700' },
    itemSub: { fontSize: 12, color: '#64748b', marginTop: 3 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
    emptyText: { color: '#94a3b8' },
});

