import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, ImagePlus, LocateFixed, MapPin, Send, Sparkles, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { ReportAssistantBubble } from '@/components/Citizen/ReportAssistantBubble';
import { WasteTypeSelector } from '@/components/Citizen/WasteTypeSelector';
import { buildReportDescription } from '@/components/utils/reportMetadata';
import { useAppStore } from '@/store/useAppStore';
import type { WasteType } from '@/types';
import {
  createWasteReport,
  fetchServiceAreas,
  fetchWasteTypes,
  uploadReportPhoto,
} from '@/components/api/backend';

type DetectLocationState = 'idle' | 'loading' | 'ready' | 'denied' | 'error';

const fallbackLocation = {
  lat: 10.7758,
  lng: 106.7,
};

function formatAreaLabelFromGeocode(result?: Location.LocationGeocodedAddress) {
  if (!result) {
    return '';
  }

  return [result.street, result.subregion, result.city].filter(Boolean).join(', ');
}

export default function ReportWasteScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAppStore();

  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | null>(null);
  const [description, setDescription] = useState('');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ wasteType: WasteType; confidence: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationState, setLocationState] = useState<DetectLocationState>('idle');
  const [locationLabel, setLocationLabel] = useState('Đang phát hiện vị trí...');
  const [location, setLocation] = useState(fallbackLocation);

  const safeBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(citizen)/home');
  }, [router]);

  const wasteTypesQuery = useQuery({
    queryKey: ['waste-types'],
    queryFn: fetchWasteTypes,
  });

  const serviceAreasQuery = useQuery({
    queryKey: ['service-areas'],
    queryFn: fetchServiceAreas,
  });

  const wasteTypes = useMemo(() => wasteTypesQuery.data ?? [], [wasteTypesQuery.data]);
  const selectedArea = serviceAreasQuery.data?.[0];

  const randomWasteType = useMemo(() => {
    if (!wasteTypes.length) {
      return null;
    }

    return wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
  }, [wasteTypes]);

  const detectCurrentLocation = useCallback(async () => {
    setLocationState('loading');
    setLocationLabel('Đang phát hiện vị trí...');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationState('denied');
        setLocationLabel(selectedArea?.name ?? 'Chưa cấp quyền vị trí');
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        lat: current.coords.latitude,
        lng: current.coords.longitude,
      });

      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        const label = formatAreaLabelFromGeocode(geocode[0]);
        setLocationLabel(label || selectedArea?.name || 'Đã lấy vị trí hiện tại');
      } catch {
        setLocationLabel(selectedArea?.name ?? 'Đã lấy vị trí hiện tại');
      }

      setLocationState('ready');
    } catch {
      setLocationState('error');
      setLocationLabel(selectedArea?.name ?? 'Không thể lấy vị trí tự động');
      setLocation(fallbackLocation);
    }
  }, [selectedArea?.name]);

  useEffect(() => {
    void detectCurrentLocation();
  }, [detectCurrentLocation]);

  const applyAiSuggestion = useCallback(() => {
    if (!randomWasteType) {
      return;
    }

    setAiResult({ wasteType: randomWasteType, confidence: 0.87 });
    setSelectedWasteType(randomWasteType);
  }, [randomWasteType]);

  const pickImage = useCallback(
    async (source: 'camera' | 'library') => {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Thiếu quyền camera', 'Vui lòng cho phép camera để chụp ảnh báo cáo.');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) {
          Alert.alert('Thiếu quyền thư viện ảnh', 'Vui lòng cho phép truy cập ảnh để tải lên.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (result.canceled) {
        return;
      }

      setImage(result.assets[0].uri);
      setAiResult(null);
      setIsAnalyzing(true);

      setTimeout(() => {
        applyAiSuggestion();
        setIsAnalyzing(false);
      }, 1000);
    },
    [applyAiSuggestion]
  );

  const handleSubmit = useCallback(async () => {
    const parsedEstimatedWeight = estimatedWeightKg.trim()
      ? Number(estimatedWeightKg)
      : null;
    if (!selectedWasteType || !image) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ảnh và loại rác trước khi gửi báo cáo.');
      return;
    }

    if (
      estimatedWeightKg.trim() &&
      (!Number.isFinite(parsedEstimatedWeight) || (parsedEstimatedWeight ?? 0) <= 0)
    ) {
      Alert.alert(
        'Sá»‘ kÃ½ chÆ°a há»£p lá»‡',
        'Náº¿u báº¡n muá»‘n nháº­p sá»‘ kÃ½ Æ°á»›c tÃ­nh, vui lÃ²ng dÃ¹ng má»™t sá»‘ lá»›n hÆ¡n 0.'
      );
      return;
    }

    if (!selectedArea?.areaId) {
      Alert.alert(
        'Thiếu khu vực',
        'Chưa xác định được service area. Vui lòng đợi đồng bộ khu vực rồi thử lại.'
      );
      return;
    }

    if (!accessToken) {
      Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng mở lại ứng dụng để đồng bộ phiên mới.');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedPhotoUrl = image.startsWith('http')
        ? image
        : await uploadReportPhoto(accessToken, image);

      await createWasteReport(accessToken, {
        latitude: location.lat,
        longitude: location.lng,
        description: buildReportDescription(description, parsedEstimatedWeight),
        wasteTypeId: selectedWasteType.wasteTypeId,
        areaId: selectedArea?.areaId,
        reportPhotoUrl: uploadedPhotoUrl,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reports', 'mine'] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'mine', user?.userId] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'mine', 'history', user?.userId] }),
      ]);

      Alert.alert('Gửi báo cáo thành công', 'Cảm ơn bạn đã góp phần giữ thành phố xanh sạch.', [
        { text: 'Xong', onPress: safeBack },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi báo cáo';
      Alert.alert('Gửi báo cáo thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    accessToken,
    description,
    estimatedWeightKg,
    image,
    location.lat,
    location.lng,
    queryClient,
    safeBack,
    selectedArea?.areaId,
    selectedWasteType,
    user?.userId,
  ]);

  const canSubmit = !!selectedWasteType && !!image && !!selectedArea?.areaId && !isSubmitting;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={safeBack} style={styles.closeButton} activeOpacity={0.8}>
            <X size={20} color={Colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo rác thải</Text>
          <View style={styles.closeButtonSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={[Colors.primary[700], Colors.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>Báo cáo nhanh trong 1 phút</Text>
            <Text style={styles.heroSubtitle}>
              Ảnh rõ ràng + vị trí chính xác sẽ giúp đội thu gom xử lý nhanh hơn.
            </Text>
          </LinearGradient>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionStep}>Bước 1</Text>
              <Text style={styles.sectionTitle}>Ảnh hiện trường</Text>
            </View>

            <View style={styles.previewBox}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Camera size={34} color={Colors.primary[500]} />
                  <Text style={styles.previewTitle}>Chưa có ảnh báo cáo</Text>
                  <Text style={styles.previewSub}>Chụp hoặc tải ảnh để tiếp tục</Text>
                </View>
              )}
            </View>

            <View style={styles.photoActionRow}>
              <TouchableOpacity
                style={styles.photoAction}
                onPress={() => void pickImage('camera')}
                activeOpacity={0.85}
              >
                <Camera size={18} color={Colors.primary[700]} />
                <Text style={styles.photoActionText}>Chụp ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoAction}
                onPress={() => void pickImage('library')}
                activeOpacity={0.85}
              >
                <ImagePlus size={18} color={Colors.primary[700]} />
                <Text style={styles.photoActionText}>Tải ảnh</Text>
              </TouchableOpacity>
            </View>

            {isAnalyzing && (
              <View style={styles.aiAnalyzing}>
                <ActivityIndicator size="small" color={Colors.accent[600]} />
                <Text style={styles.aiText}>AI đang gợi ý loại rác...</Text>
              </View>
            )}

            {aiResult && (
              <View style={[styles.aiResult, { borderColor: aiResult.wasteType.color }]}>
                <Sparkles size={18} color={aiResult.wasteType.color} />
                <Text style={styles.aiResultText}>
                  AI đề xuất: {aiResult.wasteType.name} ({Math.round(aiResult.confidence * 100)}%)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionStep}>Bước 2</Text>
              <Text style={styles.sectionTitle}>Chọn loại rác</Text>
            </View>
            <WasteTypeSelector
              wasteTypes={wasteTypes}
              selectedId={selectedWasteType?.wasteTypeId}
              onSelect={setSelectedWasteType}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionStep}>Bước 3</Text>
              <Text style={styles.sectionTitle}>Vị trí tự động</Text>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationIconWrap}>
                {locationState === 'loading' ? (
                  <ActivityIndicator size="small" color={Colors.primary[600]} />
                ) : (
                  <MapPin size={18} color={Colors.primary[700]} />
                )}
              </View>

              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{locationLabel}</Text>
                <Text style={styles.locationCoords}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshLocationButton}
                onPress={() => void detectCurrentLocation()}
                activeOpacity={0.85}
              >
                <LocateFixed size={16} color={Colors.primary[700]} />
                <Text style={styles.refreshLocationText}>Làm mới</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionStep}>Bước 4</Text>
              <Text style={styles.sectionTitle}>Mô tả thêm (tuỳ chọn)</Text>
            </View>
            <TextInput
              style={styles.descriptionInput}
              multiline
              numberOfLines={5}
              placeholder="Ví dụ: Có nhiều túi rác gần trạm xe buýt, có mùi hôi..."
              placeholderTextColor={Colors.neutral[400]}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionStep}>Gá»£i Ã½ thÃªm</Text>
              <Text style={styles.sectionTitle}>Æ¯á»›c lÆ°á»£ng khá»‘i lÆ°á»£ng</Text>
            </View>

            <View style={styles.weightSummaryCard}>
              <View>
                <Text style={styles.weightSummaryLabel}>Sá»‘ kÃ½ Æ°á»›c tÃ­nh</Text>
                <Text style={styles.weightSummaryHint}>
                  Nháº­p gáº§n Ä‘Ãºng nháº¥t cÃ³ thá»ƒ Ä‘á»ƒ doanh nghiá»‡p Æ°á»›c lÆ°á»£ng náº¯ng lá»±c thu gom.
                </Text>
              </View>
              <Text style={styles.weightSummaryValue}>
                {estimatedWeightKg.trim() ? `${estimatedWeightKg.trim()} kg` : '--'}
              </Text>
            </View>

            <TextInput
              style={styles.weightInput}
              keyboardType="decimal-pad"
              placeholder="VÃ­ dá»¥: 12.5"
              placeholderTextColor={Colors.neutral[400]}
              value={estimatedWeightKg}
              onChangeText={setEstimatedWeightKg}
            />

            <Text style={styles.weightHelperText}>
              Má»¥c nÃ y khÃ´ng báº¯t buá»™c, nhÆ°ng giÃºp hÃ ng chá» Ä‘iá»u phá»‘i cÃ¢n Ä‘á»‘i hÆ¡n.
            </Text>
          </View>
        </ScrollView>

        <ReportAssistantBubble
          hasImage={!!image}
          hasLocation={!!locationLabel.trim()}
          wasteTypeName={selectedWasteType?.name}
          areaName={selectedArea?.name}
          estimatedWeightKg={estimatedWeightKg}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={() => void handleSubmit()}
            disabled={!canSubmit}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.neutral.white} />
            ) : (
              <Send size={18} color={Colors.neutral.white} />
            )}
            <Text style={styles.submitText}>
              {isSubmitting ? 'Đang gửi báo cáo...' : 'Gửi báo cáo'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FBF5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  closeButtonSpacer: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
    gap: 14,
  },
  heroCard: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    ...Shadows.card,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: '#E2F2E6',
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionStep: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary[700],
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  previewBox: {
    height: 185,
    borderRadius: 14,
    backgroundColor: '#EEF7F0',
    borderWidth: 1,
    borderColor: '#DAECDC',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  previewSub: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  photoAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  aiAnalyzing: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiText: {
    fontSize: 13,
    color: Colors.accent[600],
    fontWeight: '600',
  },
  aiResult: {
    marginTop: 10,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.neutral[50],
    borderRadius: 10,
  },
  aiResultText: {
    fontSize: 13,
    color: Colors.neutral[700],
    fontWeight: '600',
  },
  locationCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFF0E2',
    backgroundColor: '#F7FCF8',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[100],
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
    marginRight: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  locationCoords: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  refreshLocationButton: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  refreshLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  weightSummaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFF0E2',
    backgroundColor: '#F7FCF8',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weightSummaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary[700],
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
  weightInput: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 15,
    color: Colors.neutral[800],
  } as TextStyle,
  weightHelperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral[500],
  },
  descriptionInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral.white,
    padding: 14,
    fontSize: 15,
    color: Colors.neutral[800],
  } as TextStyle,
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#DDEFE2',
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.soft,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
});
