import React from 'react';
import { Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type MapViewProps } from 'react-native-maps';

type MapProvider = 'google' | 'maplibre';

const envProvider = (process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'google').toLowerCase();
const activeProvider: MapProvider = envProvider === 'maplibre' ? 'maplibre' : 'google';

export function AppMapView(props: MapViewProps) {
  const webMapProps =
    Platform.OS === 'web' && activeProvider === 'google'
      ? ({ googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } as const)
      : undefined;

  const nativeMapProps =
    Platform.OS === 'android' && activeProvider === 'google'
      ? ({ provider: PROVIDER_GOOGLE } as const)
      : undefined;

  return <MapView {...(nativeMapProps ?? {})} {...(webMapProps ?? {})} {...props} />;
}

export function getActiveMapProvider() {
  return activeProvider;
}
