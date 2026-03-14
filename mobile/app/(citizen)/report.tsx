import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import type { TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, MapPin, Sparkles, Send, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { wasteTypes } from '@/data/mockData';
import { WasteTypeSelector } from '@/components/Citizen/WasteTypeSelector';
import { useAppStore } from '@/store/useAppStore';
import type { WasteType } from '@/types';

export default function ReportWasteScreen() {
  const router = useRouter();
  const { addPoints } = useAppStore();
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | null>(null);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{wasteType: WasteType; confidence: number} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location] = useState({ lat: 10.7758, lng: 106.7000 });

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Simulate AI analysis
      setIsAnalyzing(true);
      setTimeout(() => {
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        setAiResult({ wasteType: randomType, confidence: 0.87 });
        setSelectedWasteType(randomType);
        setIsAnalyzing(false);
      }, 1500);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedWasteType || !image) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại rác và chụp ảnh');
      return;
    }

    // Add points for report
    addPoints(500);
    Alert.alert(
      'Thành công!',
      'Báo cáo của bạn đã được gửi. Bạn nhận được 500 điểm!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [selectedWasteType, image, addPoints, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.neutral[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo rác</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chụp ảnh rác</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Camera size={40} color={Colors.primary[500]} />
                <Text style={styles.uploadText}>Chạm để chọn ảnh</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* AI Result */}
          {isAnalyzing && (
            <View style={styles.aiAnalyzing}>
              <Sparkles size={20} color={Colors.accent[500]} />
              <Text style={styles.aiText}>AI đang phân tích...</Text>
            </View>
          )}

          {aiResult && (
            <View style={[styles.aiResult, { borderColor: aiResult.wasteType.color }]}>
              <Sparkles size={20} color={aiResult.wasteType.color} />
              <View style={styles.aiResultText}>
                <Text style={styles.aiResultTitle}>
                  AI gợi ý: {aiResult.wasteType.name}
                </Text>
                <Text style={styles.aiResultConfidence}>
                  Độ chính xác: {Math.round(aiResult.confidence * 100)}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Waste Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại rác</Text>
          <WasteTypeSelector
            wasteTypes={wasteTypes}
            selectedId={selectedWasteType?.wasteTypeId}
            onSelect={setSelectedWasteType}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vị trí</Text>
          <View style={styles.locationCard}>
            <MapPin size={20} color={Colors.primary[600]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>Quận 1, TP.HCM</Text>
              <Text style={styles.locationCoords}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả (tùy chọn)</Text>
          <TextInput
            style={styles.descriptionInput}
            multiline
            numberOfLines={4}
            placeholder="Mô tả thêm về loại rác, số lượng, tình trạng..."
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (!selectedWasteType || !image) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedWasteType || !image}
        >
          <Send size={20} color={Colors.neutral.white} />
          <Text style={styles.submitText}>Gửi báo cáo</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginHorizontal: 16,
    marginBottom: 12,
  },
  imageUpload: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[300],
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  aiAnalyzing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
  },
  aiText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.accent[600],
    fontWeight: '500',
  },
  aiResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  aiResultText: {
    marginLeft: 12,
  },
  aiResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  aiResultConfidence: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    ...Shadows.card,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  locationCoords: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  descriptionInput: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.neutral[800],
    minHeight: 100,
  } as TextStyle,
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
});
