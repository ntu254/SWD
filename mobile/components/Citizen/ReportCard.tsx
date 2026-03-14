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

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: Colors.status.pending, bgColor: Colors.neutral[100] },
  ACCEPTED: { label: 'Đã duyệt', color: Colors.status.info, bgColor: Colors.secondary[50] },
  ASSIGNED: { label: 'Đã gán', color: Colors.accent[500], bgColor: Colors.accent[50] },
  COLLECTED: { label: 'Đã thu gom', color: Colors.status.success, bgColor: Colors.primary[50] },
  REJECTED: { label: 'Từ chối', color: Colors.status.error, bgColor: '#FFEBEE' },
};

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const status = statusConfig[report.status];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(report)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: report.reportPhotoUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: report.wasteTypeColor || Colors.neutral[400] }]}>
            <Text style={styles.badgeText}>{report.wasteTypeName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {report.description || 'Không có mô tả'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.locationText}>{report.areaName}</Text>
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
    marginBottom: 8,
    lineHeight: 20,
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
