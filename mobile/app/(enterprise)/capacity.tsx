import {
  createEnterpriseCapability,
  deleteEnterpriseCapability,
  fetchEnterpriseCapabilities,
  fetchServiceAreas,
  fetchWasteTypes,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Gauge, Plus, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeIsoDate(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!ISO_DATE_PATTERN.test(trimmed)) {
    throw new Error(`${label} phải đúng định dạng YYYY-MM-DD`);
  }
  return trimmed;
}

export default function EnterpriseCapacityScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [selectedWasteTypeIds, setSelectedWasteTypeIds] = useState<string[]>([]);
  const [dailyCapacity, setDailyCapacity] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');

  const capabilitiesQuery = useQuery({
    queryKey: ['enterprise', 'capabilities'],
    queryFn: () => fetchEnterpriseCapabilities(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const serviceAreasQuery = useQuery({
    queryKey: ['service-areas', 'enterprise', 'capacity'],
    queryFn: fetchServiceAreas,
  });

  const wasteTypesQuery = useQuery({
    queryKey: ['waste-types', 'enterprise', 'capacity'],
    queryFn: fetchWasteTypes,
  });

  const deleteMutation = useMutation({
    mutationFn: async (capabilityId: string) => {
      if (!accessToken) {
        return;
      }
      await deleteEnterpriseCapability(accessToken, capabilityId);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['enterprise', 'capabilities'] }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        return;
      }

      const parsedCapacity = Number.parseFloat(dailyCapacity);
      if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
        throw new Error('Công suất phải là số lớn hơn 0');
      }
      if (selectedAreaIds.length === 0 || selectedWasteTypeIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 khu vực và 1 loại rác');
      }

      const allCombos: { serviceAreaId: string; wasteTypeId: string }[] = [];
      selectedAreaIds.forEach((serviceAreaId) => {
        selectedWasteTypeIds.forEach((wasteTypeId) => {
          allCombos.push({ serviceAreaId, wasteTypeId });
        });
      });

      const existingComboKeys = new Set(
        capabilities.map((cap) => `${cap.serviceAreaId}:${cap.wasteTypeId}`)
      );

      const createTargets = allCombos.filter(
        (combo) => !existingComboKeys.has(`${combo.serviceAreaId}:${combo.wasteTypeId}`)
      );
      const skippedCount = allCombos.length - createTargets.length;

      const normalizedFrom = normalizeIsoDate(effectiveFrom, 'Hiệu lực từ');
      const normalizedTo = normalizeIsoDate(effectiveTo, 'Đến ngày');
      if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
        throw new Error('Hiệu lực từ phải nhỏ hơn hoặc bằng đến ngày');
      }
      if (createTargets.length === 0) {
        throw new Error('Tất cả cấu hình đã tồn tại');
      }

      const settled = await Promise.allSettled(
        createTargets.map((target) =>
          createEnterpriseCapability(accessToken, {
            serviceAreaId: target.serviceAreaId,
            wasteTypeId: target.wasteTypeId,
            dailyCapacityKg: parsedCapacity,
            effectiveFrom: normalizedFrom,
            effectiveTo: normalizedTo,
          })
        )
      );

      const createdCount = settled.filter((item) => item.status === 'fulfilled').length;
      const failedCount = settled.length - createdCount;
      const firstFailureMessage = settled.find((item) => item.status === 'rejected');

      if (createdCount === 0 && firstFailureMessage?.status === 'rejected') {
        throw firstFailureMessage.reason;
      }

      return { createdCount, failedCount, skippedCount };
    },
    onSuccess: async (summary) => {
      await queryClient.invalidateQueries({ queryKey: ['enterprise', 'capabilities'] });
      setDailyCapacity('');
      setEffectiveFrom('');
      setEffectiveTo('');
      setSelectedAreaIds([]);
      setSelectedWasteTypeIds([]);
      setShowCreateForm(false);

      if (!summary) {
        return;
      }

      const { createdCount, failedCount, skippedCount } = summary;
      if (failedCount > 0 || skippedCount > 0) {
        Alert.alert(
          'Đã lưu một phần',
          `Tạo mới: ${createdCount}\nThất bại: ${failedCount}\nĐã tồn tại bỏ qua: ${skippedCount}`
        );
        return;
      }

      Alert.alert('Thành công', `Đã tạo ${createdCount} cấu hình năng lực`);
    },
    onError: (error) => {
      const rawMessage = error instanceof Error ? error.message : 'Không thể tạo capability';
      const normalized = rawMessage.toLowerCase();
      const message =
        normalized.includes('already exists') || normalized.includes('da ton tai')
          ? 'Cấu hình năng lực đã tồn tại cho khu vực và loại rác này.'
          : normalized.includes('invalid request format')
            ? 'Dữ liệu không hợp lệ. Kiểm tra định dạng ngày YYYY-MM-DD.'
            : normalized.includes('data conflict')
              ? 'Dữ liệu bị xung đột. Hãy kiểm tra capability trùng lặp hoặc dữ liệu liên kết.'
              : rawMessage;
      Alert.alert('Lỗi tạo cấu hình', message);
    },
  });

  const capabilities = capabilitiesQuery.data ?? [];
  const serviceAreas = useMemo(() => serviceAreasQuery.data ?? [], [serviceAreasQuery.data]);
  const wasteTypes = useMemo(() => wasteTypesQuery.data ?? [], [wasteTypesQuery.data]);

  const toggleSelected = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleDelete = (capabilityId: string) => {
    Alert.alert('Xóa năng lực', 'Bạn có chắc muốn xóa cấu hình này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(capabilityId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Năng lực xử lý</Text>
          <Text style={styles.subtitle}>Quản lý công suất và khu vực</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreateForm((prev) => !prev)}
        >
          <Plus size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      {capabilitiesQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.accent[600]} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {showCreateForm ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>Thêm cấu hình năng lực</Text>

              <Text style={styles.inputLabel}>Khu vực phục vụ</Text>
              <View style={styles.chipRow}>
                {serviceAreas.map((area) => (
                  <TouchableOpacity
                    key={area.areaId}
                    style={[styles.chip, selectedAreaIds.includes(area.areaId) && styles.chipActive]}
                    onPress={() => toggleSelected(area.areaId, setSelectedAreaIds)}
                  >
                    <Text
                      style={[styles.chipText, selectedAreaIds.includes(area.areaId) && styles.chipTextActive]}
                    >
                      {area.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.selectedText}>Đã chọn: {selectedAreaIds.length} khu vực</Text>

              <Text style={styles.inputLabel}>Loại rác tiếp nhận</Text>
              <View style={styles.chipRow}>
                {wasteTypes.map((item) => (
                  <TouchableOpacity
                    key={item.wasteTypeId}
                    style={[
                      styles.chip,
                      selectedWasteTypeIds.includes(item.wasteTypeId) && styles.chipActive,
                    ]}
                    onPress={() => toggleSelected(item.wasteTypeId, setSelectedWasteTypeIds)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedWasteTypeIds.includes(item.wasteTypeId) && styles.chipTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.selectedText}>Đã chọn: {selectedWasteTypeIds.length} loại rác</Text>

              <Text style={styles.inputLabel}>Công suất (kg/ngày)</Text>
              <TextInput
                style={styles.input}
                value={dailyCapacity}
                onChangeText={setDailyCapacity}
                keyboardType="numeric"
                placeholder="Ví dụ: 1200"
                placeholderTextColor={Colors.neutral[400]}
              />

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>Hiệu lực từ</Text>
                  <TextInput
                    style={styles.input}
                    value={effectiveFrom}
                    onChangeText={setEffectiveFrom}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.neutral[400]}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>Đến ngày</Text>
                  <TextInput
                    style={styles.input}
                    value={effectiveTo}
                    onChangeText={setEffectiveTo}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.neutral[400]}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.createButton, createMutation.isPending && styles.createButtonDisabled]}
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                <Text style={styles.createButtonText}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Lưu cấu hình hàng loạt'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {capabilities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Chưa có cấu hình năng lực</Text>
              <Text style={styles.emptySub}>Hãy thêm capability trong backend để đồng bộ dữ liệu.</Text>
            </View>
          ) : null}

          {capabilities.map((cap) => {
            const daily = cap.dailyCapacityKg || 0;
            const used = cap.usedCapacityKg || 0;
            const usagePercent = daily > 0 ? (used / daily) * 100 : 0;

            return (
              <View key={cap.capabilityId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Gauge size={16} color={Colors.accent[600]} />
                    <Text style={styles.typeText}>{cap.wasteTypeName || 'Loại rác'}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Alert.alert('Thông báo', 'Tính năng sửa đang được cập nhật.')}
                    >
                      <Edit3 size={16} color={Colors.neutral[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(cap.capabilityId)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} color={Colors.status.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.areaName}>{cap.serviceAreaName || 'Chưa gán khu vực'}</Text>

                <View style={styles.capacityInfo}>
                  <View style={styles.capacityRow}>
                    <Text style={styles.capacityLabel}>Công suất:</Text>
                    <Text style={styles.capacityValue}>{daily} kg/ngày</Text>
                  </View>
                  <View style={styles.capacityRow}>
                    <Text style={styles.capacityLabel}>Đã sử dụng:</Text>
                    <Text style={styles.capacityValue}>{used} kg</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(Math.max(usagePercent, 0), 100)}%`,
                          backgroundColor:
                            usagePercent > 80
                              ? Colors.status.error
                              : usagePercent > 50
                                ? Colors.accent[500]
                                : Colors.status.success,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(usagePercent)}% sử dụng</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  createCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 8,
  },
  inputLabel: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
  },
  chipActive: {
    backgroundColor: Colors.accent[600],
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
  selectedText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.neutral[800],
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  createButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: Colors.accent[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  emptyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[700],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  capacityInfo: {
    marginBottom: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
  capacityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 6,
    textAlign: 'right',
  },
});
