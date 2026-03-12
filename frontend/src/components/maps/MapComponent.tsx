import React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultMarkerIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultMarkerIcon;

const markerStatusColors: Record<string, string> = {
  PENDING: "#ba873c",
  ACCEPTED: "#4e7bd9",
  ASSIGNED: "#5c55a2",
  ON_THE_WAY: "#2c7b90",
  COLLECTED: "#1f5d4e",
  REJECTED: "#d97c57",
};

const createStatusIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-icon",
    html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:3px solid rgba(255,255,255,0.96);box-shadow:0 10px 20px rgba(24,36,34,0.22);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  status: string;
  popupContent?: React.ReactNode;
}

interface MapComponentProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

function MapEvents({
  onClick,
}: {
  onClick?: (lat: number, lng: number) => void;
}) {
  useMap().on("click", (event) => {
    onClick?.(event.latlng.lat, event.latlng.lng);
  });

  return null;
}

function RecenterMap({ center }: { center?: [number, number] }) {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  points,
  center = [21.0285, 105.8542],
  zoom = 13,
  className = "map-shell h-[420px] w-full",
  onMapClick,
  interactive = true,
}) => {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />
        {interactive && onMapClick ? <MapEvents onClick={onMapClick} /> : null}

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createStatusIcon(markerStatusColors[point.status] ?? "#73878b")}
          >
            {point.popupContent ? (
              <Popup>
                <div className="min-w-[200px]">{point.popupContent}</div>
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
