import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import type { WasteReport } from '@/types';
import { AppMapView } from '@/components/maps/AppMapView';

interface NearbyReportsMapProps {
  reports: WasteReport[];
  userLocation?: { latitude: number; longitude: number };
}

const { width } = Dimensions.get('window');

export const NearbyReportsMap: React.FC<NearbyReportsMapProps> = ({
  reports,
  userLocation
}) => {
  const initialRegion = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 10.7758,
    longitude: 106.7000,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Báo cáo gần đây</Text>
      <View style={styles.mapContainer}>
        <AppMapView
          style={styles.map}
          initialRegion={initialRegion}
        >
          {userLocation && (
            <Marker
              coordinate={userLocation}
              pinColor={Colors.secondary[500]}
              title="Vị trí của bạn"
            />
          )}
          {reports.map((report) => (
            report.latitude && report.longitude && (
              <Marker
                key={report.reportId}
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                pinColor={report.wasteTypeColor || Colors.primary[500]}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{report.wasteTypeName}</Text>
                    <Text style={styles.calloutDesc} numberOfLines={2}>
                      {report.description}
                    </Text>
                    <Text style={styles.calloutStatus}>{report.status}</Text>
                  </View>
                </Callout>
              </Marker>
            )
          ))}
        </AppMapView>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.status.pending }]} />
            <Text style={styles.legendText}>Chờ duyệt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.status.info }]} />
            <Text style={styles.legendText}>Đã duyệt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent[500] }]} />
            <Text style={styles.legendText}>Đã gán</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginHorizontal: 16,
    marginBottom: 12,
  },
  mapContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.white,
    ...Shadows.card,
  },
  map: {
    width: width - 32,
    height: 200,
  },
  callout: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  legend: {
    flexDirection: 'row',
    padding: 12,
    gap: 16,
    backgroundColor: Colors.neutral.white,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
});
