"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Standard Blue Pin (Normal Stock >= 30)
const blueIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Critical Red Pin (Low Stock < 30)
const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Gold Pin for the Central Logistics Hub (Dar El Beïda)
const hubIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Live Moving Truck Icon (Custom DivIcon Badge)
const truckIcon = L.divIcon({
  className: "custom-truck-icon",
  html: `<div style="background:#10b981;color:#020617;font-weight:bold;font-size:16px;width:34px;height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;border:2px solid #ffffff;box-shadow:0 0 12px rgba(16,185,129,0.9);">🚚</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export interface MapResource {
  id: string;
  name: string;
  quantity: number;
  type: string;
  lat: number;
  lng: number;
  organization?: {
    name: string;
    type: string;
  };
}

export interface ActiveConvoy {
  targetId: string;
  targetName: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  currentLat: number;
  currentLng: number;
  progress: number;
}

interface AlgiersMapProps {
  resources: MapResource[];
  activeConvoy: ActiveConvoy | null;
  onSelectCoords: (lat: number, lng: number) => void;
}

function MapClickHandler({
  onSelectCoords,
}: {
  onSelectCoords: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelectCoords(
        Number(e.latlng.lat.toFixed(4)),
        Number(e.latlng.lng.toFixed(4))
      );
    },
  });
  return null;
}

export default function AlgiersMap({
  resources,
  activeConvoy,
  onSelectCoords,
}: AlgiersMapProps) {
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
      <MapContainer
        center={[36.738, 3.12]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelectCoords={onSelectCoords} />

        {/* Central Logistics Hub Marker (Dar El Beïda, Algiers) */}
        <Marker position={[36.7131, 3.2081]} icon={hubIcon}>
          <Popup>
            <div className="text-slate-900 text-xs space-y-1">
              <p className="font-bold text-sm">🏭 Algiers Central Logistics Hub</p>
              <p>Dar El Beïda Dispatch Center</p>
              <p className="text-emerald-700 font-semibold">Origin for Supply Trucks</p>
            </div>
          </Popup>
        </Marker>

        {/* Active Convoy Route Line & Moving Truck */}
        {activeConvoy && (
          <>
            <Polyline
              positions={[
                [activeConvoy.startLat, activeConvoy.startLng],
                [activeConvoy.endLat, activeConvoy.endLng],
              ]}
              pathOptions={{
                color: "#10b981",
                weight: 4,
                dashArray: "8, 8",
              }}
            />
            <Marker
              position={[activeConvoy.currentLat, activeConvoy.currentLng]}
              icon={truckIcon}
            >
              <Popup>
                <div className="text-slate-900 text-xs space-y-1">
                  <p className="font-bold text-sm">🚚 Convoy En Route</p>
                  <p>Destination: {activeConvoy.targetName}</p>
                  <p className="font-semibold text-emerald-700">
                    Progress: {activeConvoy.progress}% (+50 units)
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Resource Markers */}
        {resources.map((item) => {
          const isLowStock = item.quantity < 30;
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={isLowStock ? redIcon : blueIcon}
            >
              <Popup>
                <div className="text-slate-900 text-xs space-y-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  {isLowStock && (
                    <p className="text-red-600 font-bold uppercase">
                      ⚠ Critical Low Stock!
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Type:</span> {item.type}
                  </p>
                  <p>
                    <span className="font-semibold">Stock:</span>{" "}
                    {item.quantity} units
                  </p>
                  <p>
                    <span className="font-semibold">Org:</span>{" "}
                    {item.organization?.name || "Assigned"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}