import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Polyline } from 'react-native-maps';
import { ArrowLeft, Navigation, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/constants/colors';
import { AppMapView } from '@/components/maps/AppMapView';
import { fetchCollectorTasks } from '@/components/api/backend';
import { useAppStore } from '@/store/useAppStore';

const { width, height } = Dimensions.get('window');
const defaultCoordinate = { latitude: 10.7758, longitude: 106.7 };

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
    queryKey: ['collector', 'tasks'],
    queryFn: () => fetchCollectorTasks(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const myActiveTasks = useMemo(
    () =>
      (tasksQuery.data ?? []).filter((assignment) =>
        ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(assignment.status)
      ),
    [tasksQuery.data]
  );

  const taskStops = useMemo(
    () =>
      myActiveTasks
        .map((task, index) => {
          const latitude = task.task?.report?.latitude;
          const longitude = task.task?.report?.longitude;

          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return null;
          }

          return {
            id: task.assignmentId,
            order: index + 1,
            coordinate: { latitude, longitude },
            title:
              task.task?.report?.wasteTypeName ||
              task.task?.report?.reporterName ||
              `Nhiệm vụ ${index + 1}`,
            description:
              task.task?.report?.areaName ||
              task.task?.areaName ||
              'Khu vực thu gom',
            subtitle: task.task?.report?.reporterName || task.status,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [myActiveTasks]
  );

  const initialRegion = useMemo(() => {
    const firstStop = taskStops[0]?.coordinate ?? defaultCoordinate;

    return {
      latitude: firstStop.latitude,
      longitude: firstStop.longitude,
      latitudeDelta: taskStops.length > 0 ? 0.04 : 0.1,
      longitudeDelta: taskStops.length > 0 ? 0.04 : 0.1,
    };
  }, [taskStops]);

  const routeCoordinates = useMemo(() => {
    if (taskStops.length === 0) {
      return [];
    }

    return [defaultCoordinate, ...taskStops.map((stop) => stop.coordinate)];
  }, [taskStops]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={safeBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuyến đường thu gom</Text>
        <View style={styles.headerSpacer} />
      </View>

      <AppMapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={defaultCoordinate}
          pinColor={Colors.secondary[500]}
          title="Vị trí của bạn"
        />

        {taskStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            pinColor={Colors.accent[500]}
            title={stop.title}
            description={stop.description}
          />
        ))}

        {routeCoordinates.length > 1 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.secondary[500]}
            strokeWidth={4}
          />
        ) : null}
      </AppMapView>

      <View style={styles.bottomSheet}>
        <View style={styles.routeInfo}>
          <View style={styles.routeStat}>
            <Navigation size={20} color={Colors.secondary[600]} />
            <View style={styles.routeStatText}>
              <Text style={styles.routeStatValue}>{(taskStops.length * 2.5).toFixed(1)} km</Text>
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
                <Text style={styles.taskName}>
                  {task.task?.report?.wasteTypeName || task.task?.areaName || 'Khu vực'}
                </Text>
                <Text style={styles.taskStatus}>
                  {task.task?.report?.reporterName ||
                    task.task?.report?.areaName ||
                    task.status}
                </Text>
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
  headerSpacer: {
    width: 40,
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
