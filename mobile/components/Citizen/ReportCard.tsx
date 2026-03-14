import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import type { WasteReport } from '@/types';

interface ReportCardProps {
  report: WasteReport;
  onPress?: (report: WasteReport) => void;
}

const statusConfig: Record<
  WasteReport['status'],
  { label: string; color: string; bgColor: string; helper: string }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: Colors.status.pending,
    bgColor: Colors.neutral[100],
    helper: 'Đang chờ doanh nghiệp xác nhận',
  },
  ACCEPTED: {
    label: 'Đã duyệt',
    color: Colors.status.info,
    bgColor: Colors.secondary[50],
    helper: 'Báo cáo đã được tiếp nhận',
  },
  ASSIGNED: {
    label: 'Đã gán',
    color: Colors.accent[500],
    bgColor: Colors.accent[50],
    helper: 'Đã phân công cho nhân viên thu gom',
  },
  ON_THE_WAY: {
    label: 'Đang di chuyển',
    color: Colors.secondary[600],
    bgColor: Colors.secondary[50],
    helper: 'Nhân viên đang đến vị trí của bạn',
  },
  COLLECTED: {
    label: 'Đã thu gom',
    color: Colors.status.success,
    bgColor: Colors.primary[50],
    helper: 'Đã xử lý xong báo cáo',
  },
  REJECTED: {
    label: 'Từ chối',
    color: Colors.status.error,
    bgColor: '#FFEBEE',
    helper: 'Báo cáo không hợp lệ hoặc trùng lặp',
  },
};

const statusFlow: WasteReport['status'][] = [
  'PENDING',
  'ACCEPTED',
  'ASSIGNED',
  'ON_THE_WAY',
  'COLLECTED',
];

function getStatusProgress(status: WasteReport['status']) {
  if (status === 'REJECTED') {
    return 0;
  }

  const stepIndex = statusFlow.indexOf(status);
  if (stepIndex < 0) {
    return 0;
  }

  return (stepIndex + 1) / statusFlow.length;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const status = statusConfig[report.status];
  const progress = getStatusProgress(report.status);
  const progressColor = report.status === 'REJECTED' ? Colors.status.error : Colors.primary[600];
  const imageUri = report.reportPhotoUrl || 'https://picsum.photos/200/200?grayscale';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(report)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: report.wasteTypeColor || Colors.neutral[400] }]}>
            <Text style={styles.badgeText}>{report.wasteTypeName || 'Rác'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {report.description || 'Không có mô tả'}
        </Text>
        <Text style={[styles.helperText, { color: status.color }]} numberOfLines={1}>
          {status.helper}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressColor,
                width: `${Math.max(progress * 100, 8)}%`,
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.locationText}>{report.areaName || 'Chưa rõ khu vực'}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={Colors.neutral[500]} />
            <Text style={styles.timeText}>
              {new Date(report.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.neutral[400]} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    ...Shadows.soft,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.neutral.white,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral[200],
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  locationText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 8,
  },
});
