import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Polyline } from 'react-native-maps';
import { ArrowLeft, Navigation, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { taskAssignments } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { AppMapView } from '@/components/maps/AppMapView';

const { width, height } = Dimensions.get('window');

export default function CollectorMapScreen() {
  const router = useRouter();
  const { user } = useAppStore();

  const myActiveTasks = taskAssignments.filter(
    a => a.collectorUserId === user?.userId &&
    ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY'].includes(a.status)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuyến đường thu gom</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <AppMapView
        style={styles.map}
        initialRegion={{
          latitude: 10.7758,
          longitude: 106.7000,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Current Location */}
        <Marker
          coordinate={{ latitude: 10.7758, longitude: 106.7000 }}
          pinColor={Colors.secondary[500]}
          title="Vị trí của bạn"
        />

        {/* Task Locations */}
        {myActiveTasks.map((task, index) => (
          <Marker
            key={task.assignmentId}
            coordinate={{
              latitude: 10.7758 + (index * 0.01),
              longitude: 106.7000 + (index * 0.01)
            }}
            pinColor={Colors.accent[500]}
            title={`Nhiệm vụ ${index + 1}`}
          />
        ))}

        {/* Route Line */}
        <Polyline
          coordinates={[
            { latitude: 10.7758, longitude: 106.7000 },
            { latitude: 10.7858, longitude: 106.7100 },
            { latitude: 10.7958, longitude: 106.7200 },
          ]}
          strokeColor={Colors.secondary[500]}
          strokeWidth={4}
        />
      </AppMapView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.routeInfo}>
          <View style={styles.routeStat}>
            <Navigation size={20} color={Colors.secondary[600]} />
            <View style={styles.routeStatText}>
              <Text style={styles.routeStatValue}>12.5 km</Text>
              <Text style={styles.routeStatLabel}>Tổng quãng đường</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeStat}>
            <Clock size={20} color={Colors.accent[600]} />
            <View style={styles.routeStatText}>
              <Text style={styles.routeStatValue}>2h 30p</Text>
              <Text style={styles.routeStatLabel}>ThờI gian dự kiến</Text>
            </View>
          </View>
        </View>

        <View style={styles.taskList}>
          <Text style={styles.taskListTitle}>Nhiệm vụ ({myActiveTasks.length})</Text>
          {myActiveTasks.map((task, index) => (
            <View key={task.assignmentId} style={styles.taskItem}>
              <View style={styles.taskNumber}>
                <Text style={styles.taskNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.task?.areaName || 'Khu vực'}</Text>
                <Text style={styles.taskStatus}>{task.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.neutral.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  map: {
    width: width,
    height: height * 0.5,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    marginBottom: 20,
  },
  routeStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    marginLeft: 12,
  },
  routeStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  routeStatLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  routeDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 16,
  },
  taskList: {
    flex: 1,
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary[600],
  },
  taskInfo: {
    marginLeft: 12,
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  taskStatus: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
