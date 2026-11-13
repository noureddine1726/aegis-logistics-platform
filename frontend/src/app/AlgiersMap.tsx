"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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

interface MapResource {
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

interface AlgiersMapProps {
  resources: MapResource[];
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
  onSelectCoords,
}: AlgiersMapProps) {
  return (
    <div className="h-[380px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
      <MapContainer
        center={[36.7538, 3.0588]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelectCoords={onSelectCoords} />

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