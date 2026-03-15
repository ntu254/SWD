import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Image as ImageIcon,
  MapPin,
  Navigation,
  PackageCheck,
  Scale,
  Warehouse,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeCollectorTask,
  fetchCollectorTaskById,
  fetchReportById,
  updateCollectorTaskStatus,
  uploadCollectorEvidence,
} from '@/components/api/backend';
import { AppMapView } from '@/components/maps/AppMapView';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';

type SortingLevel = 'GOOD' | 'FAIR' | 'POOR';

const sortingLevels: { key: SortingLevel; label: string }[] = [
  { key: 'GOOD', label: 'Tốt' },
  { key: 'FAIR', label: 'Khá' },
  { key: 'POOR', label: 'Kém' },
];

const statusLabels: Record<string, string> = {
  ASSIGNED: 'Được gán',
  ACCEPTED: 'Đã nhận',
  ON_THE_WAY: 'Đang di chuyển',
  IN_PROGRESS: 'Đang xử lý',
  COLLECTED: 'Đã thu gom',
  COMPLETED: 'Hoàn thành',
};

export default function CollectorTaskDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { taskId: rawTaskId } = useLocalSearchParams<{ taskId: string | string[] }>();
  const { accessToken } = useAppStore();
  const taskId = Array.isArray(rawTaskId)
    ? (rawTaskId[0] ?? '')
    : (rawTaskId ?? '');

  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [measuredWeightKg, setMeasuredWeightKg] = useState('');
  const [collectorNote, setCollectorNote] = useState('');
  const [sortingLevel, setSortingLevel] = useState<SortingLevel>('GOOD');

  const taskQuery = useQuery({
    queryKey: ['collector', 'task-detail', taskId],
    queryFn: () => fetchCollectorTaskById(accessToken ?? '', taskId),
    enabled: !!accessToken && !!taskId,
  });

  const assignment = taskQuery.data;

  const reportQuery = useQuery({
    queryKey: ['collector', 'task-detail', 'report', assignment?.task?.reportId],
    queryFn: () => fetchReportById(accessToken ?? '', assignment!.task!.reportId!),
    enabled: !!accessToken && !!assignment?.task?.reportId && !assignment?.task?.report,
  });

  const report = reportQuery.data ?? assignment?.task?.report;
  const normalizedStatus = assignment?.status ?? 'ASSIGNED';
  const isAssigned = normalizedStatus === 'ASSIGNED';
  const isAccepted = normalizedStatus === 'ACCEPTED';
  const isInRoute = normalizedStatus === 'ON_THE_WAY' || normalizedStatus === 'IN_PROGRESS';
  const isCompleted = normalizedStatus === 'COLLECTED' || normalizedStatus === 'COMPLETED';

  const parsedWeight = Number(measuredWeightKg);
  const hasValidWeight =
    measuredWeightKg.trim().length > 0 &&
    Number.isFinite(parsedWeight) &&
    parsedWeight > 0;

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'ACCEPTED' | 'ON_THE_WAY') =>
      updateCollectorTaskStatus(accessToken ?? '', taskId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collector', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['collector', 'task-detail', taskId] }),
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      Alert.alert('Cập nhật thất bại', message);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      if (!proofImageUri) {
        throw new Error('Cần có ảnh minh chứng trước khi hoàn tất nhiệm vụ.');
      }
      if (!hasValidWeight) {
        throw new Error('Khối lượng cân phải lớn hơn 0 kg.');
      }

      const uploadedPhotoUrl = await uploadCollectorEvidence(accessToken ?? '', proofImageUri);

      return completeCollectorTask(accessToken ?? '', taskId, {
        visitStatus: 'SUCCESS',
        note: collectorNote || 'Completed from collector mobile detail',
        photoUrls: [uploadedPhotoUrl],
        wasteItems: report?.wasteTypeId
          ? [
              {
                wasteTypeId: report.wasteTypeId,
                weightKg: parsedWeight,
                sortingLevel,
                contaminationNote: collectorNote || undefined,
              },
            ]
          : [],
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collector', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['collector', 'task-detail', taskId] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'mine'] }),
      ]);
      Alert.alert('Hoàn tất thành công', 'Nhiệm vụ đã được cập nhật và đồng bộ.', [
        {
          text: 'Xong',
          onPress: () => router.replace('/(collector)/tasks'),
        },
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Không thể hoàn tất nhiệm vụ';
      Alert.alert('Hoàn tất thất bại', message);
    },
  });

  const mapRegion = useMemo(() => {
    if (!report?.latitude || !report?.longitude) {
      return null;
    }

    return {
      latitude: report.latitude,
      longitude: report.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [report?.latitude, report?.longitude]);

  const pickEvidence = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Thiếu quyền camera', 'Vui lòng cho phép camera để chụp ảnh minh chứng.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setProofImageUri(result.assets[0].uri);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể mở camera';
      Alert.alert('Lỗi camera', message);
    }
  };

  if (taskQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={Colors.secondary[600]} />
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <ArrowLeft size={20} color={Colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết nhiệm vụ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyState}>
          <ClipboardList size={42} color={Colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Không tải được nhiệm vụ</Text>
          <Text style={styles.emptySubtitle}>
            Nhiệm vụ có thể đã được cập nhật hoặc không còn thuộc về tài khoản hiện tại.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const reportDescription = report?.description?.trim() || 'Chưa có mô tả bổ sung từ báo cáo gốc.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <ArrowLeft size={20} color={Colors.neutral[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhiệm vụ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroEyebrow}>Nhiệm vụ collector</Text>
              <Text style={styles.heroTitle}>{assignment.task?.areaName || 'Điểm rác cần thu gom'}</Text>
              <Text style={styles.heroSubtitle}>
                {assignment.task?.enterpriseName
                  ? `Đơn vị xử lý: ${assignment.task.enterpriseName}`
                  : 'Mở biểu mẫu để cập nhật thu gom tại hiện trường.'}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {statusLabels[normalizedStatus] || normalizedStatus}
              </Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.metaPill}>
              <Warehouse size={14} color={Colors.neutral.white} />
              <Text style={styles.metaPillText}>{assignment.task?.enterpriseName || 'Chưa rõ đơn vị'}</Text>
            </View>
            {report?.estimatedWeightKg ? (
              <View style={styles.metaPill}>
                <Scale size={14} color={Colors.neutral.white} />
                <Text style={styles.metaPillText}>{report.estimatedWeightKg} kg công dân ước tính</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statCard, styles.statCardHalf]}>
            <MapPin size={18} color={Colors.secondary[700]} />
            <Text style={styles.statLabel}>Khu vực</Text>
            <Text style={styles.statValue}>{assignment.task?.areaName || 'Chưa xác định'}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHalf]}>
            <Clock size={18} color={Colors.secondary[700]} />
            <Text style={styles.statLabel}>Lịch hiện tại</Text>
            <Text style={styles.statValue}>{assignment.task?.scheduledDate || 'Hôm nay'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng quan điểm dừng</Text>
          <Text style={styles.cardBody}>{reportDescription}</Text>

          {isAssigned ? (
            <TouchableOpacity
              style={[styles.bannerAction, styles.acceptAction]}
              onPress={() => updateStatusMutation.mutate('ACCEPTED')}
              activeOpacity={0.88}
            >
              <CheckCircle2 size={18} color={Colors.neutral.white} />
              <Text style={styles.bannerActionText}>
                {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Nhận nhiệm vụ'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {isAccepted ? (
            <TouchableOpacity
              style={[styles.bannerAction, styles.routeAction]}
              onPress={() => updateStatusMutation.mutate('ON_THE_WAY')}
              activeOpacity={0.88}
            >
              <Navigation size={18} color={Colors.neutral.white} />
              <Text style={styles.bannerActionText}>
                {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Bắt đầu di chuyển'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ảnh và vị trí báo cáo</Text>
          {report?.reportPhotoUrl ? (
            <Image source={{ uri: report.reportPhotoUrl }} style={styles.reportPhoto} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <ImageIcon size={24} color={Colors.neutral[500]} />
              <Text style={styles.photoPlaceholderText}>Không có ảnh báo cáo gốc</Text>
            </View>
          )}

          {mapRegion ? (
            <View style={styles.mapWrap}>
              <AppMapView
                style={styles.map}
                initialRegion={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} />
              </AppMapView>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biểu mẫu hoàn tất</Text>
          <Text style={styles.formHint}>
            Ảnh minh chứng và khối lượng cân tại chỗ là bắt buộc để đóng nhiệm vụ này.
          </Text>

          <TouchableOpacity
            style={styles.photoCapture}
            onPress={() => void pickEvidence()}
            activeOpacity={0.88}
            disabled={isCompleted}
          >
            {proofImageUri ? (
              <Image source={{ uri: proofImageUri }} style={styles.proofPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.photoCapturePlaceholder}>
                <Camera size={20} color={Colors.secondary[700]} />
                <Text style={styles.photoCaptureTitle}>Chụp ảnh minh chứng</Text>
                <Text style={styles.photoCaptureSubtitle}>
                  Ảnh sau thu gom giúp doanh nghiệp và công dân xác nhận kết quả.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.weightSummary}>
            <View>
              <Text style={styles.weightSummaryLabel}>Cân tại chỗ</Text>
              <Text style={styles.weightSummaryHint}>Nhập số ký đã cân thực tế sau khi thu gom.</Text>
            </View>
            <Text style={styles.weightSummaryValue}>
              {hasValidWeight ? `${parsedWeight.toFixed(1)} kg` : '--'}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={measuredWeightKg}
            onChangeText={setMeasuredWeightKg}
            keyboardType="decimal-pad"
            editable={!isCompleted}
            placeholder="Ví dụ: 15.5"
            placeholderTextColor={Colors.neutral[400]}
          />

          <Text style={styles.inputLabel}>Chất lượng phân loại</Text>
          <View style={styles.segmentRow}>
            {sortingLevels.map((item) => {
              const isActive = sortingLevel === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.segment, isActive && styles.segmentActive]}
                  onPress={() => setSortingLevel(item.key)}
                  activeOpacity={0.86}
                  disabled={isCompleted}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Ghi chú collector</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={collectorNote}
            onChangeText={setCollectorNote}
            editable={!isCompleted}
            multiline
            textAlignVertical="top"
            placeholder="Ví dụ: có lẫn tạp chất, lối vào hẹp, cần xe nhỏ..."
            placeholderTextColor={Colors.neutral[400]}
          />

          {isInRoute ? (
            <TouchableOpacity
              style={[styles.completeButton, (!proofImageUri || !hasValidWeight) && styles.completeButtonDisabled]}
              onPress={() => completeTaskMutation.mutate()}
              activeOpacity={0.88}
              disabled={!proofImageUri || !hasValidWeight || completeTaskMutation.isPending}
            >
              <PackageCheck size={18} color={Colors.neutral.white} />
              <Text style={styles.completeButtonText}>
                {completeTaskMutation.isPending ? 'Đang đồng bộ...' : 'Xác nhận đã thu gom'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {isCompleted ? (
            <View style={styles.doneState}>
              <CheckCircle2 size={18} color={Colors.status.success} />
              <Text style={styles.doneStateText}>Nhiệm vụ này đã hoàn tất.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
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
    backgroundColor: Colors.secondary[600],
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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.neutral.white,
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
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardHalf: {
    flex: 1,
  },
  statCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.card,
  },
  statLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary[700],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  cardBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.neutral[700],
  },
  bannerAction: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptAction: {
    backgroundColor: Colors.secondary[600],
  },
  routeAction: {
    backgroundColor: Colors.primary[600],
  },
  bannerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  reportPhoto: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 12,
  },
  photoPlaceholder: {
    marginTop: 12,
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
    fontWeight: '600',
    color: Colors.neutral[500],
  },
  mapWrap: {
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    width: '100%',
    height: 220,
  },
  formHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.neutral[600],
  },
  photoCapture: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
  },
  photoCapturePlaceholder: {
    minHeight: 176,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptureTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  photoCaptureSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: Colors.neutral[600],
  },
  proofPhoto: {
    width: '100%',
    height: 220,
  },
  weightSummary: {
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.secondary[50],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weightSummaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary[700],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  weightSummaryHint: {
    marginTop: 6,
    maxWidth: 190,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.neutral[600],
  },
  weightSummaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  inputLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[700],
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.neutral[800],
  },
  textarea: {
    minHeight: 112,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[600],
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[600],
  },
  segmentTextActive: {
    color: Colors.neutral.white,
  },
  completeButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: Colors.secondary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  doneState: {
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneStateText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.status.success,
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
