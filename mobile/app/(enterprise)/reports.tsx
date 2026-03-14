import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';

export default function EnterpriseReportsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Báo cáo & Thống kê</Text>
          <Text style={styles.subtitle}>Xem báo cáo chi tiết</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Tổng quan tháng này</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2,450 kg</Text>
              <Text style={styles.statLabel}>Tổng thu gom</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Chuyến đi</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Hiệu suất</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Báo cáo có sẵn</Text>

        {['Báo cáo tháng 3/2024', 'Báo cáo tháng 2/2024', 'Báo cáo tháng 1/2024'].map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <FileText size={24} color={Colors.accent[600]} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>{report}</Text>
              <Text style={styles.reportDate}>PDF • 2.4 MB</Text>
            </View>
            <View style={styles.downloadBtn}>
              <Download size={20} color={Colors.neutral.white} />
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
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  statLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reportName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  reportDate: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
