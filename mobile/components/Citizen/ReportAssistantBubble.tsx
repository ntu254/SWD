import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircleMore, Sparkles, X } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';

type TipKey = 'photo' | 'wasteType' | 'location' | 'weight';

interface ReportAssistantBubbleProps {
  hasImage: boolean;
  hasLocation: boolean;
  wasteTypeName?: string | null;
  areaName?: string | null;
  estimatedWeightKg?: string;
}

function buildCompletionLabel({
  hasImage,
  hasLocation,
  wasteTypeName,
  estimatedWeightKg,
}: ReportAssistantBubbleProps) {
  const completedSteps = [
    hasImage,
    Boolean(wasteTypeName),
    hasLocation,
    Boolean(estimatedWeightKg?.trim()),
  ].filter(Boolean).length;

  if (completedSteps <= 1) {
    return 'Bạn mới hoàn thành phần nền tảng. Hãy ưu tiên ảnh và vị trí trước.';
  }

  if (completedSteps === 4) {
    return 'Hồ sơ đang khá đầy đủ. Bạn có thể rà lại mô tả rồi gửi báo cáo.';
  }

  return `Bạn đã xong ${completedSteps}/4 mục quan trọng. Thêm bước còn lại để báo cáo rõ ràng hơn.`;
}

export function ReportAssistantBubble(props: ReportAssistantBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTip, setActiveTip] = useState<TipKey>('photo');

  const tips = useMemo<Record<TipKey, { label: string; content: string }>>(
    () => ({
      photo: {
        label: 'Ảnh hiện trường',
        content: props.hasImage
          ? 'Ảnh đã có. Hãy chắc ảnh nhìn rõ cả loại rác lẫn vùng xung quanh để đội thu gom xác minh nhanh hơn.'
          : 'Chụp gần thêm một bước, lấy đủ bối cảnh xung quanh và tránh ngược sáng để doanh nghiệp dễ duyệt hơn.',
      },
      wasteType: {
        label: 'Loại rác',
        content: props.wasteTypeName
          ? `Bạn đang chọn "${props.wasteTypeName}". Nếu ảnh có nhiều loại rác, hãy chọn loại chiếm phần lớn khối lượng.`
          : 'Nếu còn phân vân, hãy chọn loại rác chiếm tỉ trọng lớn nhất trong ảnh. Không chắc thì mô tả thêm ở phần ghi chú.',
      },
      location: {
        label: 'Ghim vị trí',
        content: props.hasLocation
          ? `Vị trí hiện tại đang neo ở ${props.areaName ?? 'khu vực đã chọn'}. Hãy kiểm tra lại ghim nằm sát đống rác thay vì giữa đường.`
          : 'Bật quyền vị trí hoặc ghim thủ công ngay chỗ rác. Sai vài chục mét là collector có thể phải gọi lại để hỏi.',
      },
      weight: {
        label: 'Ước lượng số ký',
        content: props.estimatedWeightKg?.trim()
          ? `Bạn đã ước lượng khoảng ${props.estimatedWeightKg.trim()} kg. Con số này giúp doanh nghiệp ưu tiên và chuẩn bị năng lực phù hợp.`
          : 'Không cần quá chính xác. Hãy nhập số ký ước tính gần đúng nhất để doanh nghiệp đánh giá mức độ ưu tiên tốt hơn.',
      },
    }),
    [props]
  );

  const recommendation = useMemo(() => {
    if (!props.hasImage) {
      return 'Gợi ý ưu tiên: thêm ảnh rõ nét trước.';
    }
    if (!props.wasteTypeName) {
      return 'Gợi ý ưu tiên: xác nhận loại rác.';
    }
    if (!props.hasLocation) {
      return 'Gợi ý ưu tiên: ghim lại vị trí thật sát điểm rác.';
    }
    if (!props.estimatedWeightKg?.trim()) {
      return 'Gợi ý ưu tiên: thêm số ký ước tính.';
    }

    return 'Gợi ý ưu tiên: thêm mô tả ngắn về mùi, độ cồng kềnh hoặc điểm nhận diện.';
  }, [props]);

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {isOpen ? (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.titleWrap}>
              <View style={styles.iconWrap}>
                <Sparkles size={16} color={Colors.primary[700]} />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>Trợ lý AI báo cáo</Text>
                <Text style={styles.subtitle}>Gợi ý nhanh theo form hiện tại</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <X size={16} color={Colors.neutral[600]} />
            </Pressable>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Đánh giá nhanh</Text>
            <Text style={styles.statusText}>{buildCompletionLabel(props)}</Text>
            <Text style={styles.statusHint}>{recommendation}</Text>
          </View>

          <View style={styles.tipRow}>
            {(Object.keys(tips) as TipKey[]).map((tipKey) => (
              <Pressable
                key={tipKey}
                onPress={() => setActiveTip(tipKey)}
                style={[
                  styles.tipChip,
                  activeTip === tipKey && styles.tipChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.tipChipText,
                    activeTip === tipKey && styles.tipChipTextActive,
                  ]}
                >
                  {tips[tipKey].label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.answerCard}>
            <Text style={styles.answerText}>{tips[activeTip].content}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={styles.fab}
      >
        <MessageCircleMore size={22} color={Colors.neutral.white} />
        <View style={styles.fabGlow} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 92,
    alignItems: 'flex-end',
    zIndex: 30,
  },
  panel: {
    width: 308,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D6EAD9',
    backgroundColor: 'rgba(255,255,255,0.98)',
    ...Shadows.card,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[100],
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
  },
  statusCard: {
    marginTop: 14,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F3FBF5',
    borderWidth: 1,
    borderColor: '#DDEEE1',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.neutral[800],
    fontWeight: '600',
  },
  statusHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral[600],
  },
  tipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tipChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
  },
  tipChipActive: {
    backgroundColor: Colors.primary[600],
  },
  tipChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral[600],
  },
  tipChipTextActive: {
    color: Colors.neutral.white,
  },
  answerCard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  answerText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.neutral[700],
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    ...Shadows.card,
  },
  fabGlow: {
    position: 'absolute',
    top: -5,
    right: -5,
    bottom: -5,
    left: -5,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(67, 160, 71, 0.18)',
  },
});
