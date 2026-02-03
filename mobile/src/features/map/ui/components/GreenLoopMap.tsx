import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type?: "collection" | "bin" | "enterprise";
}

interface GreenLoopMapProps {
  locations: Location[];
  initialRegion?: Region;
  onMarkerPress?: (location: Location) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 10.8231, // Ho Chi Minh City
  longitude: 106.6297,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const getMarkerColor = (type?: string) => {
  switch (type) {
    case "collection":
      return "#059669"; // brand-600
    case "bin":
      return "#22c55e"; // brand-500
    case "enterprise":
      return "#f59e0b"; // accent-500
    default:
      return "#059669";
  }
};

export function GreenLoopMap({
  locations,
  initialRegion = DEFAULT_REGION,
  onMarkerPress,
}: GreenLoopMapProps) {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.description}
            pinColor={getMarkerColor(location.type)}
            onPress={() => onMarkerPress?.(location)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
