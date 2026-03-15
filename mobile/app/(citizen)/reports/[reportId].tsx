import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  MapPin,
  Scale,
  Truck,
  XCircle,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { fetchReportById } from '@/components/api/backend';
import { AppMapView } from '@/components/maps/AppMapView';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { WasteReport } from '@/types';

type TimelineStep = {
  key: string;
  label: string;
  helper: string;
  active: boolean;
  completed: boolean;
  error?: boolean;
};

const statusConfig: Record<
  WasteReport['status'],
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: 'Chờ duyệt', color: Colors.status.pending, bgColor: Colors.neutral[100] },
  ACCEPTED: { label: 'Đã duyệt', color: Colors.status.info, bgColor: Colors.secondary[50] },
  ASSIGNED: { label: 'Đã gán', color: Colors.accent[600], bgColor: Colors.accent[50] },
  ON_THE_WAY: {
    label: 'Đang di chuyển',
    color: Colors.secondary[600],
    bgColor: Colors.secondary[50],
  },
  COLLECTED: {
    label: 'Đã thu gom',
    color: Colors.status.success,
    bgColor: Colors.primary[50],
  },
  REJECTED: { label: 'Từ chối', color: Colors.status.error, bgColor: '#FFEBEE' },
};

function buildTimeline(report: WasteReport): TimelineStep[] {
  if (report.status === 'REJECTED') {
    return [
      {
        key: 'created',
        label: 'Đã tạo báo cáo',
        helper: 'Báo cáo đã được gửi lên hệ thống.',
        active: true,
        completed: true,
      },
      {
        key: 'rejected',
        label: 'Báo cáo bị từ chối',
        helper: 'Doanh nghiệp phụ trách đã xem xét nhưng chưa thể xử lý báo cáo này.',
        active: true,
        completed: false,
        error: true,
      },
    ];
  }

  const orderedStatuses: WasteReport['status'][] = [
    'PENDING',
    'ACCEPTED',
    'ASSIGNED',
    'ON_THE_WAY',
    'COLLECTED',
  ];
  const currentIndex = orderedStatuses.indexOf(report.status);

  return [
    {
      key: 'pending',
      label: 'Đã tạo báo cáo',
      helper: 'Báo cáo đang chờ xác minh ban đầu.',
      active: currentIndex >= 0,
      completed: currentIndex > 0,
    },
    {
      key: 'accepted',
      label: 'Doanh nghiệp đã tiếp nhận',
      helper: 'Báo cáo đã được đơn vị phụ trách chấp nhận xử lý.',
      active: currentIndex >= 1,
      completed: currentIndex > 1,
    },
    {
      key: 'assigned',
      label: 'Đã gán collector',
      helper: 'Một nhân viên thu gom đã được phân công cho điểm rác này.',
      active: currentIndex >= 2,
      completed: currentIndex > 2,
    },
    {
      key: 'route',
      label: 'Collector đang di chuyển',
      helper: 'Nhân viên đang trên đường đến vị trí bạn đã ghim.',
      active: currentIndex >= 3,
      completed: currentIndex > 3,
    },
    {
      key: 'collected',
      label: 'Đã thu gom xong',
      helper: 'Điểm rác đã được xử lý hoàn tất.',
      active: currentIndex >= 4,
      completed: currentIndex >= 4,
    },
  ];
}

function TimelineIcon({ step }: { step: TimelineStep }) {
  if (step.error) {
    return <XCircle size={18} color={Colors.status.error} />;
  }

  if (step.key === 'route') {
    return <Truck size={18} color={Colors.secondary[600]} />;
  }

  return <CheckCircle2 size={18} color={Colors.primary[700]} />;
}

export default function CitizenReportDetailScreen() {
  const router = useRouter();
  const { reportId: rawReportId } = useLocalSearchParams<{ reportId: string | string[] }>();
  const { accessToken } = useAppStore();
  const reportId = Array.isArray(rawReportId)
    ? (rawReportId[0] ?? '')
    : (rawReportId ?? '');

  const reportQuery = useQuery({
    queryKey: ['citizen', 'report-detail', reportId],
    queryFn: () => fetchReportById(accessToken ?? '', reportId),
    enabled: !!accessToken && !!reportId,
  });

  const report = reportQuery.data;
  const status = report ? statusConfig[report.status] : null;
  const timeline = useMemo(() => (report ? buildTimeline(report) : []), [report]);

  if (reportQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </SafeAreaView>
    );
  }

  if (!report || !status) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <ArrowLeft size={20} color={Colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyState}>
          <XCircle size={38} color={Colors.status.error} />
          <Text style={styles.emptyTitle}>Không tải được báo cáo</Text>
          <Text style={styles.emptySubtitle}>
            Báo cáo có thể không còn khả dụng hoặc phiên đăng nhập đã hết hạn.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const createdAtText = new Date(report.createdAt).toLocaleString('vi-VN');
  const hasCoordinates =
    typeof report.latitude === 'number' && typeof report.longitude === 'number';

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <ArrowLeft size={20} color={Colors.neutral[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroEyebrow}>Báo cáo công dân</Text>
              <Text style={styles.heroTitle}>{report.wasteTypeName || 'Báo cáo rác'}</Text>
              <Text style={styles.heroSubtitle}>
                Tạo lúc {createdAtText}
                {report.areaName ? ` tại ${report.areaName}` : ''}.
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.metaPill}>
              <MapPin size={14} color={Colors.primary[700]} />
              <Text style={styles.metaPillText}>{report.areaName || 'Chưa rõ khu vực'}</Text>
            </View>
            {report.estimatedWeightKg ? (
              <View style={styles.metaPill}>
                <Scale size={14} color={Colors.primary[700]} />
                <Text style={styles.metaPillText}>{report.estimatedWeightKg} kg ước tính</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mô tả hiện trường</Text>
          <Text style={styles.cardBody}>
            {report.description?.trim() || 'Người báo cáo chưa để lại mô tả bổ sung.'}
          </Text>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.gridItem]}>
            <Clock3 size={18} color={Colors.primary[700]} />
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <Text style={styles.infoValue}>{status.label}</Text>
          </View>
          <View style={[styles.infoCard, styles.gridItem]}>
            <MapPin size={18} color={Colors.primary[700]} />
            <Text style={styles.infoLabel}>Tọa độ</Text>
            <Text style={styles.infoValue}>
              {hasCoordinates
                ? `${report.latitude?.toFixed(5)}, ${report.longitude?.toFixed(5)}`
                : 'Chưa có dữ liệu'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tiến trình xử lý</Text>
          <View style={styles.timeline}>
            {timeline.map((step) => (
              <View key={step.key} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    step.error
                      ? styles.timelineDotError
                      : step.completed
                        ? styles.timelineDotDone
                        : step.active
                          ? styles.timelineDotActive
                          : styles.timelineDotIdle,
                  ]}
                >
                  <TimelineIcon step={step} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{step.label}</Text>
                  <Text style={styles.timelineHelper}>{step.helper}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ảnh minh chứng</Text>
          {report.reportPhotoUrl ? (
            <Image source={{ uri: report.reportPhotoUrl }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <ImageIcon size={24} color={Colors.neutral[500]} />
              <Text style={styles.photoPlaceholderText}>Không có ảnh đính kèm</Text>
            </View>
          )}
        </View>

        {hasCoordinates ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vị trí đã ghim</Text>
            <View style={styles.mapWrap}>
              <AppMapView
                style={styles.map}
                initialRegion={{
                  latitude: report.latitude!,
                  longitude: report.longitude!,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{ latitude: report.latitude!, longitude: report.longitude! }}
                  pinColor={report.wasteTypeColor || Colors.primary[500]}
                />
              </AppMapView>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FBF5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3FBF5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    ...Shadows.soft,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: Colors.primary[600],
    ...Shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.92)',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: '#E2F2E6',
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral[800],
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.neutral[700],
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: '#E2F2E6',
    ...Shadows.card,
  },
  infoLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral[800],
    fontWeight: '700',
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: Colors.primary[100],
  },
  timelineDotActive: {
    backgroundColor: Colors.secondary[50],
  },
  timelineDotIdle: {
    backgroundColor: Colors.neutral[100],
  },
  timelineDotError: {
    backgroundColor: '#FDECEA',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  timelineHelper: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.neutral[600],
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  photoPlaceholder: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: Colors.neutral[500],
    fontWeight: '600',
  },
  mapWrap: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    width: '100%',
    height: 220,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.neutral[600],
  },
});
