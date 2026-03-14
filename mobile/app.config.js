module.exports = ({ config }) => {
  const mapProvider = (process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'google').toLowerCase();
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const useGoogleProvider = mapProvider !== 'maplibre';

  return {
    ...config,
    android: {
      ...config.android,
      config: useGoogleProvider && googleMapsApiKey
        ? {
            ...config.android?.config,
            googleMaps: {
              ...config.android?.config?.googleMaps,
              apiKey: googleMapsApiKey,
            },
          }
        : config.android?.config,
    },
  };
};
