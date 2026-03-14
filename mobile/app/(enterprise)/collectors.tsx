import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MapPin, Star, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';


const mockCollectors = [
  { id: '1', name: 'Trần Văn B', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4.8, completed: 156, phone: '0901234567', area: 'Quận 1' },
  { id: '2', name: 'Nguyễn Văn C', avatar: 'https://i.pravatar.cc/150?u=10', rating: 4.5, completed: 124, phone: '0912345678', area: 'Quận 2' },
  { id: '3', name: 'Lê Thị D', avatar: 'https://i.pravatar.cc/150?u=11', rating: 4.9, completed: 189, phone: '0923456789', area: 'Quận 7' },
];

export default function EnterpriseCollectorsScreen() {
  const renderCollector = ({ item }: { item: typeof mockCollectors[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.header}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color={Colors.accent[500]} fill={Colors.accent[500]} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.completed}>• {item.completed} chuyến</Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.area}>{item.area}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Phone size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <TrendingUp size={16} color={Colors.primary[600]} />
          <Text style={styles.statLabel}>Hiệu suất</Text>
          <Text style={styles.statValue}>85%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Hôm nay</Text>
          <Text style={styles.statValue}>4/5 chuyến</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Khối lượng</Text>
          <Text style={styles.statValue}>42kg</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.title}>Quản lý Collector</Text>
        <Text style={styles.subtitle}>{mockCollectors.length} nhân viên</Text>
      </View>

      <FlatList
        data={mockCollectors}
        keyExtractor={(item) => item.id}
        renderItem={renderCollector}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[600],
  },
  completed: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  area: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginTop: 2,
  },
});
