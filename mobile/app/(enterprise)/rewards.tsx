import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Plus, Edit3, Trash2, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { rewardRules } from '@/data/mockData';

export default function EnterpriseRewardsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quy tắc thưởng</Text>
          <Text style={styles.subtitle}>Cấu hình điểm thưởng</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <TrendingUp size={24} color={Colors.accent[600]} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryValue}>8,500</Text>
            <Text style={styles.summaryLabel}>Điểm đã cấp tháng này</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quy tắc theo loại rác</Text>

        {rewardRules.map((rule) => (
          <View key={rule.ruleId} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <View style={styles.typeBadge}>
                <Gift size={16} color={Colors.accent[600]} />
                <Text style={styles.typeText}>{rule.wasteTypeName}</Text>
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

            <View style={styles.pointsRow}>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsValue}>{rule.pointsPerKg}</Text>
                <Text style={styles.pointsLabel}>điểm/kg</Text>
              </View>
              {rule.pointsFixed && (
                <View style={styles.pointsItem}>
                  <Text style={styles.pointsValue}>+{rule.pointsFixed}</Text>
                  <Text style={styles.pointsLabel}>điểm cố định</Text>
                </View>
              )}
              <View style={styles.pointsItem}>
                <Text style={styles.pointsValue}>{rule.sortingLevel}</Text>
                <Text style={styles.pointsLabel}>mức phân loại</Text>
              </View>
            </View>
          </View>
        ))}
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
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Shadows.card,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryInfo: {
    marginLeft: 16,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  ruleCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  pointsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 16,
  },
  pointsItem: {
    flex: 1,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
