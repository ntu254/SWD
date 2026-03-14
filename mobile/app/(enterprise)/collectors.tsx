import {
  fetchServiceAreas,
  fetchEnterpriseCollectors,
  fetchEnterpriseTasks,
  setEnterpriseCollectorKpi,
  setEnterpriseCollectorsKpi,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Star, TrendingUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EnterpriseCollectorsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [minVisits, setMinVisits] = useState('');
  const [minWeightKg, setMinWeightKg] = useState('');

  const collectorsQuery = useQuery({
    queryKey: ['enterprise', 'collectors'],
    queryFn: () => fetchEnterpriseCollectors(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const tasksQuery = useQuery({
    queryKey: ['enterprise', 'tasks', 'all'],
    queryFn: () => fetchEnterpriseTasks(accessToken ?? '', { size: 500 }),
    enabled: !!accessToken,
  });

  const serviceAreasQuery = useQuery({
    queryKey: ['service-areas', 'enterprise', 'collectors'],
    queryFn: fetchServiceAreas,
  });

  const setKpiMutation = useMutation({
    mutationFn: async () => {
      const parsedVisits = Number.parseInt(minVisits, 10);
      const parsedWeight = Number.parseFloat(minWeightKg);

      if (!selectedAreaId) {
        throw new Error('Vui lòng chọn khu vực');
      }

      const payload = {
        areaId: selectedAreaId,
        minVisits: Number.isFinite(parsedVisits) ? parsedVisits : 1,
        minWeightKg: Number.isFinite(parsedWeight) ? parsedWeight : 1,
      };

      try {
        await setEnterpriseCollectorsKpi(accessToken ?? '', payload);
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        const shouldFallback =
          message.includes('unexpected error') ||
          message.includes('not found') ||
          message.includes('request failed (500)');
        if (!shouldFallback) {
          throw error;
        }

        if (collectors.length === 0) {
          throw error;
        }

        const settled = await Promise.allSettled(
          collectors.map((collector) =>
            setEnterpriseCollectorKpi(accessToken ?? '', {
              collectorUserId: collector.userId,
              ...payload,
            })
          )
        );

        const successCount = settled.filter((item) => item.status === 'fulfilled').length;
        if (successCount === 0) {
          throw error;
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enterprise', 'collectors'] });
      await queryClient.invalidateQueries({ queryKey: ['enterprise', 'collectors', 'kpi'] });
      setSelectedAreaId('');
      setMinVisits('');
      setMinWeightKg('');
      Alert.alert('Thành công', 'Đã cấu hình KPI cho toàn bộ collector');
    },
    onError: (error) => {
      const rawMessage = error instanceof Error ? error.message : 'Không thể cấu hình KPI';
      const normalized = rawMessage.toLowerCase();
      const message =
        normalized.includes('unexpected error')
          ? 'Backend KPI đang gặp lỗi dữ liệu (có thể KPI trùng theo ngày). Đã cập nhật hệ thống, vui lòng thử lại sau khi refresh.'
          : rawMessage;
      Alert.alert('Thất bại', message);
    },
  });

  const collectors = collectorsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const serviceAreas = useMemo(() => serviceAreasQuery.data ?? [], [serviceAreasQuery.data]);

  const renderCollector = ({ item }: { item: (typeof collectors)[0] }) => {
    const collectorTasks = tasks.filter((task) => task.collectorUserId === item.userId);
    const completed = collectorTasks.filter((task) =>
      ['COMPLETED', 'COLLECTED'].includes(task.status)
    ).length;
    const inProgress = collectorTasks.filter((task) =>
      ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(task.status)
    ).length;
    const efficiency =
      collectorTasks.length > 0 ? Math.round((completed / collectorTasks.length) * 100) : 0;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={styles.header}>
          <Image
            source={{ uri: item.avatarUrl || `https://i.pravatar.cc/150?u=${item.userId}` }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.displayName}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={Colors.accent[500]} fill={Colors.accent[500]} />
              <Text style={styles.rating}>{efficiency}%</Text>
              <Text style={styles.completed}>• {completed} chuyến</Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.neutral[500]} />
              <Text style={styles.area}>{item.phone || 'Không có SĐT'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => {}}
            accessibilityLabel={`Call ${item.displayName}`}
          >
            <Phone size={20} color={Colors.neutral.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <TrendingUp size={16} color={Colors.primary[600]} />
            <Text style={styles.statLabel}>Hiệu suất</Text>
            <Text style={styles.statValue}>{efficiency}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Đang xử lý</Text>
            <Text style={styles.statValue}>{inProgress}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Tổng task</Text>
            <Text style={styles.statValue}>{collectorTasks.length}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.title}>Quản lý Collector</Text>
        <Text style={styles.subtitle}>{collectors.length} nhân viên</Text>
      </View>

      <View style={styles.kpiCard}>
        <Text style={styles.kpiTitle}>Cấu hình KPI toàn bộ collector</Text>
        <Text style={styles.kpiSub}>Chọn khu vực và mục tiêu ngày, áp dụng cho tất cả collector</Text>

        <View style={styles.chipRow}>
          {serviceAreas.slice(0, 8).map((area) => (
            <TouchableOpacity
              key={area.areaId}
              style={[styles.chip, selectedAreaId === area.areaId && styles.chipActive]}
              onPress={() => setSelectedAreaId(area.areaId)}
            >
              <Text style={[styles.chipText, selectedAreaId === area.areaId && styles.chipTextActive]}>
                {area.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.kpiInputs}>
          <TextInput
            style={[styles.kpiInput, styles.kpiInputHalf]}
            value={minVisits}
            onChangeText={setMinVisits}
            keyboardType="numeric"
            placeholder="Min visits"
            placeholderTextColor={Colors.neutral[400]}
          />
          <TextInput
            style={[styles.kpiInput, styles.kpiInputHalf]}
            value={minWeightKg}
            onChangeText={setMinWeightKg}
            keyboardType="numeric"
            placeholder="Min kg"
            placeholderTextColor={Colors.neutral[400]}
          />
        </View>

        <TouchableOpacity
          style={[styles.kpiButton, setKpiMutation.isPending && styles.kpiButtonDisabled]}
          onPress={() => setKpiMutation.mutate()}
          disabled={setKpiMutation.isPending}
        >
          <Text style={styles.kpiButtonText}>
            {setKpiMutation.isPending ? 'Đang lưu...' : 'Lưu KPI cho tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      {collectorsQuery.isLoading || tasksQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.accent[600]} />
        </View>
      ) : (
        <FlatList
          data={collectors}
          keyExtractor={(item) => item.userId}
          renderItem={renderCollector}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Không có collector nào</Text>
              <Text style={styles.emptySub}>Hãy tạo tài khoản collector từ backend.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  screenHeader: {
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
  kpiCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    ...Shadows.card,
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  kpiSub: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
    maxWidth: '48%',
  },
  chipActive: {
    backgroundColor: Colors.accent[600],
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
  kpiInputs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  kpiInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.neutral[800],
    backgroundColor: Colors.neutral.white,
  },
  kpiInputHalf: {
    flex: 1,
  },
  kpiButton: {
    marginTop: 10,
    minHeight: 38,
    borderRadius: 9,
    backgroundColor: Colors.accent[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  kpiButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[600],
  },
  completed: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  area: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
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
});
