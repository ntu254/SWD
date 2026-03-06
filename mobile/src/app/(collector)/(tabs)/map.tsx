import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useQueries, useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { MapPin, Navigation, LocateFixed } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { useAuthStore } from '../../../shared/store/authStore';
import { collectorService } from '../../../features/collector/collectorService';
import { WasteReport } from '../../../shared/types/domain';

function MapTaskCard({ report }: { report: WasteReport }) {
    const hasLocation = typeof report.latitude === 'number' && typeof report.longitude === 'number';

    const openMaps = async () => {
        if (!hasLocation) {
            Alert.alert('Thiếu vị trí', 'Báo cáo này không có tọa độ GPS.');
            return;
        }
        const lat = report.latitude!;
        const lng = report.longitude!;
        const label = report.addressText || report.areaName || 'Waste report';
        const url = Platform.select({
            ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`,
            default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        });
        if (!url) return;
        await Linking.openURL(url);
    };

    return (
        <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Báo cáo #{report.reportId.slice(-6)}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{report.status}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <MapPin size={16} color="#94a3b8" />
                <Text style={styles.rowText}>
                    {report.addressText || report.areaName || 'Chưa có địa chỉ chi tiết'}
                </Text>
            </View>
            <View style={styles.row}>
                <LocateFixed size={16} color="#94a3b8" />
                <Text style={styles.rowText}>
                    {hasLocation
                        ? `${report.latitude!.toFixed(6)}, ${report.longitude!.toFixed(6)}`
                        : 'Không có tọa độ'}
                </Text>
            </View>
            <TouchableOpacity style={styles.navigateBtn} onPress={openMaps}>
                <Navigation size={16} color="#059669" />
                <Text style={styles.navigateText}>Mở chỉ đường</Text>
            </TouchableOpacity>
        </GlassCard>
    );
}

export default function CollectorMapScreen() {
    const { user } = useAuthStore();
    const collectorId = user?.userId;

    const { data: activeTaskPage, isLoading } = useQuery({
        queryKey: ['collector-map-tasks', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getAssignedTasks(collectorId!, { page: 0, size: 30 }),
    });

    const reportIds = useMemo(
        () =>
            Array.from(
                new Set((activeTaskPage?.content ?? []).map((task) => task.reportId).filter((id): id is string => Boolean(id)))
            ),
        [activeTaskPage?.content]
    );

    const reportQueries = useQueries({
        queries: reportIds.map((reportId) => ({
            queryKey: ['collector-map-report', reportId],
            queryFn: () => collectorService.getWasteReportById(reportId),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const reports = reportQueries
        .map((query) => query.data)
        .filter((item): item is WasteReport => Boolean(item));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bản đồ thu gom</Text>
                <Text style={styles.headerSub}>Danh sách điểm thu gom cần di chuyển</Text>
            </View>

            {isLoading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Đang tải dữ liệu bản đồ...</Text>
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.emptyState}>
                    <MapPin size={52} color="#d1fae5" />
                    <Text style={styles.emptyText}>Không có điểm thu gom nào đang hoạt động.</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.reportId}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => <MapTaskCard report={item} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    card: { marginBottom: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    statusBadge: { backgroundColor: '#ecfdf5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
    statusText: { color: '#059669', fontSize: 11, fontWeight: '700' },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
    rowText: { flex: 1, color: '#64748b', fontSize: 13, lineHeight: 19 },
    navigateBtn: {
        marginTop: 10,
        borderWidth: 1.5,
        borderColor: '#a7f3d0',
        backgroundColor: '#ecfdf5',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    navigateText: { color: '#047857', fontWeight: '700' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
    emptyText: { color: '#94a3b8', textAlign: 'center' },
});

