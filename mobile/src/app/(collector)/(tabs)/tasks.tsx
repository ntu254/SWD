import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    StatusBar,
    RefreshControl,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Package, Clock, CheckCircle2, XCircle, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { Button } from '../../../shared/ui/Button';
import { useAuthStore } from '../../../shared/store/authStore';
import { collectorService } from '../../../features/collector/collectorService';
import { CollectorTask, WasteReport } from '../../../shared/types/domain';

const STATUS_LABEL: Record<string, string> = {
    ASSIGNED: 'Được giao',
    ON_THE_WAY: 'Đang di chuyển',
    COLLECTED: 'Đã thu gom',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
};

const STATUS_COLOR: Record<string, string> = {
    ASSIGNED: '#f59e0b',
    ON_THE_WAY: '#3b82f6',
    COLLECTED: '#059669',
    FAILED: '#dc2626',
    CANCELLED: '#64748b',
};

function TaskCard({
    item,
    report,
    onAccept,
    onComplete,
    onFail,
}: {
    item: CollectorTask;
    report?: WasteReport;
    onAccept: (taskId: string) => void;
    onComplete: (taskId: string) => void;
    onFail: (taskId: string) => void;
}) {
    const status = item.status;
    const badgeColor = STATUS_COLOR[status] ?? '#64748b';
    const badgeLabel = STATUS_LABEL[status] ?? status;

    return (
        <GlassCard style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}20` }]}>
                    <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                </View>
                <Text style={styles.taskId}>#{item.id.slice(-6)}</Text>
            </View>

            <View style={styles.taskInfoRow}>
                <Package size={15} color="#94a3b8" />
                <Text style={styles.taskInfo}>Báo cáo: #{item.reportId?.slice(-6) ?? '--'}</Text>
            </View>
            <View style={styles.taskInfoRow}>
                <MapPin size={15} color="#94a3b8" />
                <Text style={styles.taskInfo} numberOfLines={2}>
                    {report?.areaName || report?.addressText || 'Không có địa chỉ'}
                </Text>
            </View>
            <View style={styles.taskInfoRow}>
                <Clock size={15} color="#94a3b8" />
                <Text style={styles.taskInfo}>
                    {report?.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : 'Không có thời gian'}
                </Text>
            </View>

            {status === 'ASSIGNED' ? (
                <Button
                    title="Nhận việc"
                    variant="primary"
                    size="sm"
                    style={{ marginTop: 12 }}
                    onPress={() => onAccept(item.id)}
                />
            ) : null}

            {status === 'ON_THE_WAY' ? (
                <View style={styles.actionRow}>
                    <Button
                        title="Hoàn thành"
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle2 size={15} color="#fff" />}
                        style={{ flex: 1 }}
                        onPress={() => onComplete(item.id)}
                    />
                    <Button
                        title="Thất bại"
                        variant="outline"
                        size="sm"
                        icon={<XCircle size={15} color="#dc2626" />}
                        style={{ flex: 1 }}
                        onPress={() => onFail(item.id)}
                    />
                </View>
            ) : null}
        </GlassCard>
    );
}

function HistoryCard({ item }: { item: CollectorTask }) {
    const badgeColor = STATUS_COLOR[item.status] ?? '#64748b';
    return (
        <GlassCard style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}20` }]}>
                    <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                        {STATUS_LABEL[item.status] ?? item.status}
                    </Text>
                </View>
                <Text style={styles.taskId}>#{item.id.slice(-6)}</Text>
            </View>
            <Text style={styles.taskInfo}>Báo cáo: #{item.reportId?.slice(-6) ?? '--'}</Text>
            <Text style={styles.taskInfo}>Ghi chú: {item.note || '-'}</Text>
        </GlassCard>
    );
}

export default function CollectorTasksScreen() {
    const { user } = useAuthStore();
    const collectorId = user?.userId;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    const { data: activeTaskPage, isLoading: activeLoading, refetch: refetchActive, isRefetching: activeRefreshing } = useQuery({
        queryKey: ['collector-active-tasks', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getAssignedTasks(collectorId!, { page: 0, size: 30 }),
    });

    const { data: historyPage, isLoading: historyLoading, refetch: refetchHistory, isRefetching: historyRefreshing } = useQuery({
        queryKey: ['collector-history-tasks', collectorId],
        enabled: Boolean(collectorId),
        queryFn: () => collectorService.getJobHistory(collectorId!, { page: 0, size: 30 }),
    });

    const activeTasks = activeTaskPage?.content ?? [];
    const completedTasks = historyPage?.content.map((item) => ({
        id: item.id,
        collectorId: collectorId ?? '',
        reportId: item.reportId ?? undefined,
        enterpriseId: item.enterpriseId ?? undefined,
        status: item.status,
        note: item.note ?? undefined,
    })) ?? [];

    const reportIds = useMemo(
        () =>
            Array.from(
                new Set(activeTasks.map((task) => task.reportId).filter((id): id is string => Boolean(id)))
            ),
        [activeTasks]
    );

    const reportQueries = useQueries({
        queries: reportIds.map((reportId) => ({
            queryKey: ['collector-report-detail', reportId],
            queryFn: () => collectorService.getWasteReportById(reportId),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const reportById = useMemo(() => {
        const map: Record<string, WasteReport> = {};
        reportQueries.forEach((query, index) => {
            if (query.data) {
                map[reportIds[index]] = query.data;
            }
        });
        return map;
    }, [reportQueries, reportIds]);

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['collector-active-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['collector-history-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['collector-report-detail'] });
    };

    const acceptMutation = useMutation({
        mutationFn: (taskId: string) => collectorService.acceptTask(collectorId!, taskId),
        onSuccess: invalidateAll,
        onError: (err: any) => Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể nhận việc.'),
    });

    const statusMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: CollectorTask['status'] }) =>
            collectorService.updateTaskStatus(collectorId!, taskId, { status }),
        onSuccess: invalidateAll,
        onError: (err: any) =>
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật trạng thái.'),
    });

    const { data: wasteTypes = [], isLoading: typesLoading } = useQuery({
        queryKey: ['active-waste-types'],
        queryFn: collectorService.getActiveWasteTypes,
    });

    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [weightKg, setWeightKg] = useState<string>('');
    const [wasteTypeId, setWasteTypeId] = useState<string | null>(null);

    const completeWithProof = async () => {
        if (!completingTaskId) return;

        if (!wasteTypeId) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn loại rác.');
            return;
        }

        if (!weightKg || isNaN(Number(weightKg)) || Number(weightKg) <= 0) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập khối lượng (kg) hợp lệ.');
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert('Cần quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh xác nhận.');
            return;
        }

        const capture = await ImagePicker.launchCameraAsync({ quality: 0.75 });
        if (capture.canceled) {
            setCompletingTaskId(null);
            return;
        }

        const imageUri = capture.assets[0].uri;
        try {
            await collectorService.uploadProof(
                collectorId!,
                completingTaskId,
                imageUri,
                wasteTypeId,
                Number(weightKg)
            );
            invalidateAll();
            Alert.alert('Thành công', 'Đã cập nhật hoàn thành và gửi ảnh xác nhận. Chờ doanh nghiệp duyệt để cộng điểm.');
        } catch (err: any) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể hoàn thành công việc.');
        } finally {
            setCompletingTaskId(null);
            setWeightKg('');
            setWasteTypeId(null);
        }
    };

    const onAccept = useCallback(
        (taskId: string) => acceptMutation.mutate(taskId),
        [acceptMutation]
    );

    const onComplete = useCallback(
        (taskId: string) => {
            setCompletingTaskId(taskId);
        },
        []
    );

    const onFail = useCallback(
        (taskId: string) => {
            Alert.alert('Xác nhận', 'Đánh dấu công việc thất bại?', [
                { text: 'Huỷ', style: 'cancel' },
                { text: 'Đồng ý', onPress: () => statusMutation.mutate({ taskId, status: 'FAILED' }) },
            ]);
        },
        [statusMutation]
    );

    const isLoading = activeTab === 'active' ? activeLoading : historyLoading;
    const isRefreshing = activeTab === 'active' ? activeRefreshing : historyRefreshing;
    const onRefresh = activeTab === 'active' ? refetchActive : refetchHistory;
    const listData = activeTab === 'active' ? activeTasks : completedTasks;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <Text style={styles.headerGreeting}>Xin chào, {user?.firstName} 👷</Text>
                <Text style={styles.headerSub}>
                    Đang xử lý: <Text style={styles.headerAccent}>{activeTasks.length}</Text> • Lịch sử: <Text style={styles.headerAccent}>{completedTasks.length}</Text>
                </Text>
            </View>

            <View style={styles.tabRow}>
                {(['active', 'completed'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                            {tab === 'active' ? 'Đang thực hiện' : 'Lịch sử'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
                </View>
            ) : listData.length === 0 ? (
                <View style={styles.emptyState}>
                    <CheckCircle2 size={56} color="#d1fae5" />
                    <Text style={styles.emptyText}>
                        {activeTab === 'active'
                            ? 'Không có công việc nào đang xử lý.'
                            : 'Chưa có lịch sử công việc.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) =>
                        activeTab === 'active' ? (
                            <TaskCard
                                item={item}
                                report={item.reportId ? reportById[item.reportId] : undefined}
                                onAccept={onAccept}
                                onComplete={onComplete}
                                onFail={onFail}
                            />
                        ) : (
                            <HistoryCard item={item} />
                        )
                    }
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Proof Upload Modal */}
            <Modal
                visible={!!completingTaskId}
                transparent
                animationType="slide"
                onRequestClose={() => setCompletingTaskId(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Xác nhận thu gom</Text>
                        <Text style={styles.modalSub}>Vui lòng nhập thông tin rác đã thu gom trước khi chụp ảnh</Text>

                        <Text style={styles.label}>Loại rác</Text>
                        <View style={styles.typeGrid}>
                            {wasteTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.wasteTypeId}
                                    style={[
                                        styles.typeBtn,
                                        wasteTypeId === type.wasteTypeId && styles.typeBtnSelected
                                    ]}
                                    onPress={() => setWasteTypeId(type.wasteTypeId)}
                                >
                                    <Text style={[
                                        styles.typeBtnText,
                                        wasteTypeId === type.wasteTypeId && styles.typeBtnTextSelected
                                    ]}>
                                        {type.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Khối lượng (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số kg (VD: 5.5)"
                            keyboardType="numeric"
                            value={weightKg}
                            onChangeText={setWeightKg}
                            placeholderTextColor="#94a3b8"
                        />

                        <View style={styles.modalActionRow}>
                            <Button
                                title="Hủy"
                                variant="outline"
                                onPress={() => setCompletingTaskId(null)}
                                style={styles.modalBtn}
                            />
                            <Button
                                title="Chụp ảnh & Lưu"
                                variant="primary"
                                icon={<Camera size={16} color="#fff" />}
                                onPress={completeWithProof}
                                style={styles.modalBtn}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerGreeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    headerAccent: { color: '#6ee7b7', fontWeight: '700' },
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 3,
    },
    tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
    tabBtnActive: { backgroundColor: '#fff', shadowColor: '#059669', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
    tabBtnTextActive: { color: '#059669' },
    listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 },
    taskCard: { marginBottom: 12, padding: 16 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    statusBadgeText: { fontSize: 12, fontWeight: '700' },
    taskId: { fontSize: 12, color: '#cbd5e1', fontWeight: '500' },
    taskInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
    taskInfo: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
    emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
    modalSub: { fontSize: 14, color: '#64748b', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#0f172a', marginBottom: 16 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    typeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
    typeBtnSelected: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
    typeBtnText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    typeBtnTextSelected: { color: '#059669', fontWeight: '700' },
    modalActionRow: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1 }
});

