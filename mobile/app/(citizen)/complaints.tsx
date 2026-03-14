import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, MessageSquareWarning } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import {
  createComplaint,
  fetchMyComplaints,
  fetchMyReports,
} from '@/components/api/backend';
import type { Complaint, ComplaintCategory, ComplaintPriority, WasteReport } from '@/types';

const categories: ComplaintCategory[] = [
  'COLLECTION_ISSUE',
  'POINTS_ERROR',
  'SERVICE_ISSUE',
  'BUG',
  'OTHER',
];

const priorities: ComplaintPriority[] = ['Normal', 'High', 'Urgent'];

const categoryLabels: Record<ComplaintCategory, string> = {
  BUG: 'Bug',
  FEATURE: 'Feature',
  POINTS_ERROR: 'Lỗi điểm',
  COLLECTION_ISSUE: 'Thu gom',
  SERVICE_ISSUE: 'Dịch vụ',
  OTHER: 'Khác',
};

const statusIconMap: Record<Complaint['status'], React.ElementType> = {
  Pending: Clock,
  In_Progress: AlertCircle,
  Resolved: CheckCircle2,
  Rejected: AlertCircle,
};

function formatDate(value?: string) {
  if (!value) {
    return '--/--/----';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  return date.toLocaleDateString('vi-VN');
}

function reportTitle(report: WasteReport) {
  const waste = report.wasteTypeName || 'Báo cáo';
  const date = formatDate(report.createdAt);
  return `${waste} - ${date}`;
}

export default function CitizenComplaintsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('COLLECTION_ISSUE');
  const [priority, setPriority] = useState<ComplaintPriority>('Normal');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);

  const complaintsQuery = useQuery({
    queryKey: ['citizen', 'complaints', 'mine', user?.userId],
    queryFn: () => fetchMyComplaints(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const reportsQuery = useQuery({
    queryKey: ['reports', 'mine', 'complaints', user?.userId],
    queryFn: () => fetchMyReports(accessToken ?? '', 30),
    enabled: !!accessToken,
  });

  const recentReports = useMemo(
    () => (reportsQuery.data ?? []).slice(0, 5),
    [reportsQuery.data]
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }

      return createComplaint(accessToken, {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        priority,
        reportId: selectedReportId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['citizen', 'complaints', 'mine'] });
      setTitle('');
      setContent('');
      setCategory('COLLECTION_ISSUE');
      setPriority('Normal');
      setSelectedReportId(undefined);
      Alert.alert('Thành công', 'Đã gửi khiếu nại. Chúng tôi sẽ xử lý sớm.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể gửi khiếu nại';
      Alert.alert('Gửi thất bại', message);
    },
  });

  const complaints = complaintsQuery.data ?? [];

  const onSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nội dung khiếu nại.');
      return;
    }

    createMutation.mutate();
  };

  const onRefresh = async () => {
    await Promise.all([complaintsQuery.refetch(), reportsQuery.refetch()]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={complaintsQuery.isRefetching || reportsQuery.isRefetching}
            onRefresh={() => void onRefresh()}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Phản hồi & khiếu nại</Text>
          <Text style={styles.subtitle}>Báo cáo vấn đề thu gom hoặc điểm thưởng</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <MessageSquareWarning size={18} color={Colors.accent[700]} />
            <Text style={styles.formTitle}>Tạo khiếu nại mới</Text>
          </View>

          <Text style={styles.inputLabel}>Loại vấn đề</Text>
          <View style={styles.chipRow}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
                  {categoryLabels[item]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Mức ưu tiên</Text>
          <View style={styles.chipRow}>
            {priorities.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, priority === item && styles.chipActive]}
                onPress={() => setPriority(item)}
              >
                <Text style={[styles.chipText, priority === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Liên kết báo cáo (tùy chọn)</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !selectedReportId && styles.chipActive]}
              onPress={() => setSelectedReportId(undefined)}
            >
              <Text style={[styles.chipText, !selectedReportId && styles.chipTextActive]}>Không liên kết</Text>
            </TouchableOpacity>
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.reportId}
                style={[
                  styles.chip,
                  selectedReportId === report.reportId && styles.chipActive,
                ]}
                onPress={() => setSelectedReportId(report.reportId)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedReportId === report.reportId && styles.chipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {reportTitle(report)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Tiêu đề (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Đơn thu gom đến trễ"
            placeholderTextColor={Colors.neutral[400]}
          />

          <Text style={styles.inputLabel}>Nội dung *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            placeholderTextColor={Colors.neutral[400]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || createMutation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!content.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.neutral.white} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi khiếu nại</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử khiếu nại</Text>
          <Text style={styles.sectionSub}>{complaints.length} đơn</Text>
        </View>

        {complaintsQuery.isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={Colors.primary[600]} />
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Chưa có khiếu nại nào</Text>
            <Text style={styles.emptySub}>Thông tin khiếu nại sẽ hiển thị tại đây.</Text>
          </View>
        ) : (
          complaints.map((item) => {
            const Icon = statusIconMap[item.status] ?? Clock;

            return (
              <View key={item.complaintId} style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle}>{item.title || 'Khiếu nại'}</Text>
                  <View style={styles.statusBadge}>
                    <Icon size={14} color={Colors.neutral[600]} />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <Text style={styles.complaintContent} numberOfLines={3}>
                  {item.content}
                </Text>

                <View style={styles.complaintFooter}>
                  <Text style={styles.footerText}>{categoryLabels[item.category]}</Text>
                  <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  header: {
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.neutral[500],
  },
  formCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 14,
    ...Shadows.card,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
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
    backgroundColor: Colors.primary[600],
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.neutral[800],
  },
  textArea: {
    minHeight: 110,
  },
  submitButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  sectionHeader: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  loadingWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.soft,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  complaintCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 14,
    ...Shadows.soft,
  },
  complaintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  complaintTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  complaintContent: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.neutral[600],
  },
  complaintFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
});
