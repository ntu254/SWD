import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Bot, ChevronRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import type { WasteType } from '@/types';

interface AiWasteSuggestionBannerProps {
  isAnalyzing: boolean;
  suggestion: { wasteType: WasteType; confidence: number } | null;
  onApply: () => void;
  onDismiss: () => void;
}

export const AiWasteSuggestionBanner: React.FC<AiWasteSuggestionBannerProps> = ({
  isAnalyzing,
  suggestion,
  onApply,
  onDismiss,
}) => {
  if (isAnalyzing) {
    return (
      <LinearGradient
        colors={['#EEF2FF', '#F5F3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconWrap}>
          <ActivityIndicator size="small" color="#6366F1" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.analyzingTitle}>AI đang phân tích ảnh...</Text>
          <Text style={styles.analyzingSubtitle}>
            Nhận diện loại rác từ hình ảnh bạn cung cấp
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (!suggestion) return null;

  const confidencePercent = Math.round(suggestion.confidence * 100);
  const confidenceColor =
    confidencePercent >= 80 ? '#10B981' : confidencePercent >= 50 ? '#F59E0B' : '#94A3B8';

  return (
    <LinearGradient
      colors={['#EEF2FF', '#F0F9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <View style={styles.aiIconWrap}>
          <Bot size={14} color="#6366F1" />
        </View>
        <Text style={styles.headerLabel}>KẾT QUẢ AI</Text>
        <View
          style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
        >
          <Text style={styles.confidenceText}>{confidencePercent}%</Text>
        </View>
      </View>

      <View style={styles.suggestionRow}>
        <Sparkles size={16} color={suggestion.wasteType.color || '#6366F1'} />
        <Text style={styles.suggestionName}>
          Đề xuất: <Text style={styles.bold}>{suggestion.wasteType.name}</Text>
        </Text>
      </View>

      <Text style={styles.reasoning}>
        AI nhận diện hình ảnh có đặc điểm phù hợp với loại "{suggestion.wasteType.name}".
        Vui lòng xác nhận lại loại rác thủ công.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={onApply}
          activeOpacity={0.85}
        >
          <ChevronRight size={14} color="#FFFFFF" />
          <Text style={styles.applyText}>Áp dụng gợi ý</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          activeOpacity={0.85}
        >
          <Text style={styles.dismissText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textWrap: {
    flex: 1,
  },
  analyzingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4338CA',
  },
  analyzingSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6366F1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  aiIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6366F1',
    flex: 1,
  },
  confidenceBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  suggestionName: {
    fontSize: 14,
    color: Colors.neutral[700],
  },
  bold: {
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  reasoning: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral[500],
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  applyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dismissButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
});
