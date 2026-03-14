import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gauge, Plus, Edit3, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { enterpriseCapabilities } from '@/data/mockData';

export default function EnterpriseCapacityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Năng lực xử lý</Text>
          <Text style={styles.subtitle}>Quản lý công suất và khu vực</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {enterpriseCapabilities.map((cap) => {
          const usagePercent = ((cap.usedCapacityKg || 0) / cap.dailyCapacityKg) * 100;

          return (
            <View key={cap.capabilityId} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Gauge size={16} color={Colors.accent[600]} />
                  <Text style={styles.typeText}>{cap.wasteTypeName}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Edit3 size={16} color={Colors.neutral[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Trash2 size={16} color={Colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.areaName}>{cap.serviceAreaName}</Text>

              <View style={styles.capacityInfo}>
                <View style={styles.capacityRow}>
                  <Text style={styles.capacityLabel}>Công suất:</Text>
                  <Text style={styles.capacityValue}>{cap.dailyCapacityKg} kg/ngày</Text>
                </View>
                <View style={styles.capacityRow}>
                  <Text style={styles.capacityLabel}>Đã sử dụng:</Text>
                  <Text style={styles.capacityValue}>{cap.usedCapacityKg || 0} kg</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${usagePercent}%`,
                        backgroundColor: usagePercent > 80 ? Colors.status.error : usagePercent > 50 ? Colors.accent[500] : Colors.status.success,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(usagePercent)}% sử dụng</Text>
              </View>
            </View>
          );
        })}
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[700],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  capacityInfo: {
    marginBottom: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
  capacityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 6,
    textAlign: 'right',
  },
});
