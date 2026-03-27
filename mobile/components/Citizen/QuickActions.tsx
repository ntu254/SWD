import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, MapPin, History, Gift, MessageSquareWarning } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onReport: () => void;
  onMap: () => void;
  onHistory: () => void;
  onRewards: () => void;
  onComplaints?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onReport,
  onMap,
  onHistory,
  onRewards,
  onComplaints,
}) => {
  const actions: QuickAction[] = [
    {
      icon: Camera,
      label: 'Báo cáo',
      color: Colors.primary[700],
      bgColor: Colors.primary[100],
      onPress: onReport,
    },
    {
      icon: MapPin,
      label: 'Bản đồ',
      color: Colors.secondary[700],
      bgColor: Colors.secondary[100],
      onPress: onMap,
    },
    {
      icon: History,
      label: 'Theo dõi',
      color: Colors.accent[700],
      bgColor: Colors.accent[100],
      onPress: onHistory,
    },
    {
      icon: Gift,
      label: 'Phần thưởng',
      color: '#E91E63',
      bgColor: '#FCE4EC',
      onPress: onRewards,
    },
    {
      icon: MessageSquareWarning,
      label: 'Khiếu nại',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      onPress: onComplaints ?? (() => {}),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thao tác nhanh</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Animated.View
              key={action.label}
              entering={FadeInRight.delay(index * 100)}
              style={styles.actionWrapper}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                  <Icon size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionWrapper: {
    width: '20%',
  },
  actionButton: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral[700],
    textAlign: 'center',
  },
});

