import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { complaints } from '@/data/mockData';

const priorityColors = {
  Low: Colors.neutral[400],
  Normal: Colors.primary[500],
  High: Colors.accent[500],
  Urgent: Colors.status.error,
};

const statusIcons = {
  Pending: Clock,
  In_Progress: AlertCircle,
  Resolved: CheckCircle2,
  Rejected: AlertCircle,
};

export default function EnterpriseComplaintsScreen() {
  const renderComplaint = ({ item }: { item: typeof complaints[0] }) => {
    const StatusIcon = statusIcons[item.status];

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColors[item.priority] }]}>
              {item.priority}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: Colors.neutral[100] }]}>
            <StatusIcon size={14} color={Colors.neutral[600]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>

        <View style={styles.footer}>
          <Text style={styles.author}>{item.createdByName}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Khiếu nại</Text>
        <Text style={styles.screenSubtitle}>{complaints.length} đơn</Text>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.complaintId}
        renderItem={renderComplaint}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  author: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  date: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
});
