import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Leaf, Box, FileText, CircleDot, Wine, Smartphone, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import type { WasteType } from '@/types';

interface WasteTypeSelectorProps {
  selectedId?: string;
  onSelect: (wasteType: WasteType) => void;
  wasteTypes: WasteType[];
}

const iconMap: Record<string, React.ElementType> = {
  Leaf,
  Box,
  FileText,
  CircleDot,
  Wine,
  Smartphone,
  AlertTriangle,
};

export const WasteTypeSelector: React.FC<WasteTypeSelectorProps> = ({
  selectedId,
  onSelect,
  wasteTypes,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {wasteTypes.map((type) => {
        const Icon = iconMap[type.icon] || Box;
        const isSelected = selectedId === type.wasteTypeId;

        return (
          <TouchableOpacity
            key={type.wasteTypeId}
            style={[
              styles.item,
              isSelected && {
                backgroundColor: type.color + '12',
                borderColor: type.color,
              },
            ]}
            onPress={() => onSelect(type)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconContainer, { backgroundColor: type.color + '1F' }]}>
              <Icon size={22} color={type.color} />
            </View>
            <Text style={[styles.name, isSelected && { color: type.color }]} numberOfLines={1}>
              {type.name}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {type.isRecyclable ? 'Có thể tái chế' : 'Cần xử lý riêng'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingVertical: 6,
    gap: 10,
  },
  item: {
    width: 118,
    minHeight: 128,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E6ECE8',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 6,
    textAlign: 'center',
  },
});
