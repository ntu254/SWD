import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock, ChevronRight, Tag } from 'lucide-react-native';

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

function formatReportedAt(value?: string) {
  if (!value) {
    return 'Chưa có thời gian';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Chưa có thời gian';
  }

  return parsed.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildReportTitle(report: WasteReport) {
  if (report.wasteTypeName && report.areaName) {
    return `${report.wasteTypeName} - ${report.areaName}`;
  }

  if (report.wasteTypeName) {
    return report.wasteTypeName;
  }

  if (report.areaName) {
    return `Báo cáo tại ${report.areaName}`;
  }

  return 'Báo cáo rác thải';
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const status = statusConfig[report.status];
  const progress = getStatusProgress(report.status);
  const progressColor = report.status === 'REJECTED' ? Colors.status.error : Colors.primary[600];
  const imageUri = report.reportPhotoUrl || 'https://picsum.photos/200/200?grayscale';
  const reportTitle = buildReportTitle(report);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(report)}
      activeOpacity={0.82}
    >
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {reportTitle}
        </Text>

        <View style={styles.metaRow}>
          <Tag size={13} color={Colors.primary[600]} />
          <Text style={styles.metaText}>{report.wasteTypeName || 'Chưa rõ loại rác'}</Text>
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
          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.infoText} numberOfLines={1}>
              {report.areaName || 'Chưa rõ khu vực'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={Colors.neutral[500]} />
            <Text style={styles.infoText} numberOfLines={1}>
              {formatReportedAt(report.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    ...Shadows.soft,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  description: {
    fontSize: 13,
    color: Colors.neutral[700],
    lineHeight: 18,
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
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
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
});
