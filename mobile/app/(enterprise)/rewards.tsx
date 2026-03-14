import {
  createEnterpriseRewardRule,
  deactivateEnterpriseRewardRule,
  fetchEnterpriseRewardRules,
  fetchWasteTypes,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Gift, Plus, Trash2, TrendingUp } from 'lucide-react-native';
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

export default function EnterpriseRewardsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState('');
  const [sortingLevel, setSortingLevel] = useState<'GOOD' | 'ACCEPTABLE' | 'POOR'>('GOOD');
  const [pointsPerKg, setPointsPerKg] = useState('');
  const [pointsFixed, setPointsFixed] = useState('');

  const rulesQuery = useQuery({
    queryKey: ['enterprise', 'reward-rules'],
    queryFn: () => fetchEnterpriseRewardRules(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const wasteTypesQuery = useQuery({
    queryKey: ['waste-types', 'enterprise', 'reward-rules'],
    queryFn: fetchWasteTypes,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      if (!accessToken) {
        return;
      }
      await deactivateEnterpriseRewardRule(accessToken, ruleId);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['enterprise', 'reward-rules'] }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        return;
      }

      const parsedPerKg = Number.parseFloat(pointsPerKg);
      const parsedFixed = Number.parseFloat(pointsFixed);
      const hasPerKg = Number.isFinite(parsedPerKg);
      const hasFixed = Number.isFinite(parsedFixed);

      if (!selectedWasteTypeId) {
        throw new Error('Vui lòng chọn loại rác');
      }
      if (!hasPerKg && !hasFixed) {
        throw new Error('Cần nhập ít nhất điểm/kg hoặc điểm cố định');
      }

      await createEnterpriseRewardRule(accessToken, {
        wasteTypeId: selectedWasteTypeId,
        sortingLevel,
        pointsPerKg: hasPerKg ? parsedPerKg : undefined,
        pointsFixed: hasFixed ? parsedFixed : undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enterprise', 'reward-rules'] });
      setShowCreateForm(false);
      setSelectedWasteTypeId('');
      setSortingLevel('GOOD');
      setPointsPerKg('');
      setPointsFixed('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể tạo quy tắc';
      Alert.alert('Lỗi tạo quy tắc', message);
    },
  });

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);
  const wasteTypes = useMemo(() => wasteTypesQuery.data ?? [], [wasteTypesQuery.data]);

  const summary = useMemo(() => {
    const active = rules.filter((rule) => rule.isActive).length;
    const avgPoints =
      rules.length > 0
        ? Math.round(rules.reduce((sum, rule) => sum + (rule.pointsPerKg || 0), 0) / rules.length)
        : 0;
    return { active, avgPoints };
  }, [rules]);

  const handleDeactivate = (ruleId: string) => {
    Alert.alert('Tắt quy tắc', 'Bạn có chắc muốn tắt quy tắc này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Tắt',
        style: 'destructive',
        onPress: () => deactivateMutation.mutate(ruleId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quy tắc thưởng</Text>
          <Text style={styles.subtitle}>Cấu hình điểm thưởng</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreateForm((prev) => !prev)}
        >
          <Plus size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      {rulesQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.accent[600]} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {showCreateForm ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>Thêm quy tắc điểm thưởng</Text>

              <Text style={styles.inputLabel}>Loại rác</Text>
              <View style={styles.chipRow}>
                {wasteTypes.map((item) => (
                  <TouchableOpacity
                    key={item.wasteTypeId}
                    style={[styles.chip, selectedWasteTypeId === item.wasteTypeId && styles.chipActive]}
                    onPress={() => setSelectedWasteTypeId(item.wasteTypeId)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedWasteTypeId === item.wasteTypeId && styles.chipTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Mức phân loại</Text>
              <View style={styles.chipRow}>
                {(['GOOD', 'ACCEPTABLE', 'POOR'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.chip, sortingLevel === level && styles.chipActive]}
                    onPress={() => setSortingLevel(level)}
                  >
                    <Text style={[styles.chipText, sortingLevel === level && styles.chipTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputsRow}>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Điểm/kg</Text>
                  <TextInput
                    style={styles.input}
                    value={pointsPerKg}
                    onChangeText={setPointsPerKg}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 20"
                    placeholderTextColor={Colors.neutral[400]}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Điểm cố định</Text>
                  <TextInput
                    style={styles.input}
                    value={pointsFixed}
                    onChangeText={setPointsFixed}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 5"
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
                  {createMutation.isPending ? 'Đang tạo...' : 'Lưu quy tắc'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color={Colors.accent[600]} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryValue}>{summary.active}</Text>
              <Text style={styles.summaryLabel}>Quy tắc đang hoạt động</Text>
              <Text style={styles.summarySub}>Trung bình {summary.avgPoints} điểm/kg</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quy tắc theo loại rác</Text>

          {rules.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Chưa có reward rule</Text>
              <Text style={styles.emptySub}>Tạo quy tắc từ backend để đồng bộ dữ liệu mobile.</Text>
            </View>
          ) : null}

          {rules.map((rule) => (
            <View key={rule.ruleId} style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <View style={styles.typeBadge}>
                  <Gift size={16} color={Colors.accent[600]} />
                  <Text style={styles.typeText}>{rule.wasteTypeName || 'Loại rác'}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Alert.alert('Thông báo', 'Tính năng sửa quy tắc đang được cập nhật.')}
                  >
                    <Edit3 size={16} color={Colors.neutral[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDeactivate(rule.ruleId)}
                    disabled={deactivateMutation.isPending}
                  >
                    <Trash2 size={16} color={Colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pointsRow}>
                <View style={styles.pointsItem}>
                  <Text style={styles.pointsValue}>{rule.pointsPerKg || 0}</Text>
                  <Text style={styles.pointsLabel}>điểm/kg</Text>
                </View>
                {rule.pointsFixed ? (
                  <View style={styles.pointsItem}>
                    <Text style={styles.pointsValue}>+{rule.pointsFixed}</Text>
                    <Text style={styles.pointsLabel}>điểm cố định</Text>
                  </View>
                ) : null}
                <View style={styles.pointsItem}>
                  <Text style={styles.pointsValue}>{rule.sortingLevel}</Text>
                  <Text style={styles.pointsLabel}>mức phân loại</Text>
                </View>
              </View>
            </View>
          ))}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  createCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  inputField: {
    flex: 1,
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Shadows.card,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryInfo: {
    marginLeft: 16,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  summarySub: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  ruleCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  pointsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 16,
  },
  pointsItem: {
    flex: 1,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
    textAlign: 'center',
  },
});
