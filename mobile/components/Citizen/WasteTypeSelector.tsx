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
  wasteTypes
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
                backgroundColor: type.color + '20',
                borderColor: type.color,
                borderWidth: 2,
              }
            ]}
            onPress={() => onSelect(type)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
              <Icon size={24} color={type.color} />
            </View>
            <Text style={[styles.name, isSelected && { color: type.color, fontWeight: '700' }]}>
              {type.name}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {type.isRecyclable ? '♻️ Tái chế' : '🗑️ Xử lý'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  item: {
    width: 100,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
});
