import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Polyline } from 'react-native-maps';
import { ArrowLeft, Navigation, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppMapView } from '@/components/maps/AppMapView';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectorTasks } from '@/components/api/backend';
import { useAppStore } from '@/store/useAppStore';

const { width, height } = Dimensions.get('window');

export default function CollectorMapScreen() {
  const router = useRouter();
  const { accessToken } = useAppStore();
  const safeBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(collector)/tasks');
  };

  const tasksQuery = useQuery({
    queryKey: ['collector', 'tasks', 'map'],
    queryFn: () => fetchCollectorTasks(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const myActiveTasks = useMemo(
    () => (tasksQuery.data ?? []).filter((a) => ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(a.status)),
    [tasksQuery.data]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={safeBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuyến đường thu gom</Text>
        <View style={{ width: 40 }} />
      </View>

      <AppMapView
        style={styles.map}
        initialRegion={{
          latitude: 10.7758,
          longitude: 106.7,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker
          coordinate={{ latitude: 10.7758, longitude: 106.7 }}
          pinColor={Colors.secondary[500]}
          title='Vị trí của bạn'
        />

        {myActiveTasks.map((task, index) => (
          <Marker
            key={task.assignmentId}
            coordinate={{
              latitude: 10.7758 + index * 0.01,
              longitude: 106.7 + index * 0.01,
            }}
            pinColor={Colors.accent[500]}
            title={`Nhiệm vụ ${index + 1}`}
            description={task.task?.areaName || 'Khu vực thu gom'}
          />
        ))}

        <Polyline
          coordinates={[
            { latitude: 10.7758, longitude: 106.7 },
            { latitude: 10.7858, longitude: 106.71 },
            { latitude: 10.7958, longitude: 106.72 },
          ]}
          strokeColor={Colors.secondary[500]}
          strokeWidth={4}
        />
      </AppMapView>

      <View style={styles.bottomSheet}>
        <View style={styles.routeInfo}>
          <View style={styles.routeStat}>
            <Navigation size={20} color={Colors.secondary[600]} />
            <View style={styles.routeStatText}>
              <Text style={styles.routeStatValue}>{(myActiveTasks.length * 2.5).toFixed(1)} km</Text>
              <Text style={styles.routeStatLabel}>Tổng quãng đường</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeStat}>
            <Clock size={20} color={Colors.accent[600]} />
            <View style={styles.routeStatText}>
              <Text style={styles.routeStatValue}>{Math.max(1, myActiveTasks.length)}h</Text>
              <Text style={styles.routeStatLabel}>Thời gian dự kiến</Text>
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
    width,
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
