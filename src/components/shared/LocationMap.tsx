"use client";

import { useEffect, useState } from "react";

interface LocationMapProps {
  centerLat: number;
  centerLng: number;
  radius: number;
  userLat?: number;
  userLng?: number;
  locationName: string;
  className?: string;
}

// Component yang akan di-render setelah client-side hydration
function ClientOnlyMap({
  centerLat,
  centerLng,
  radius,
  userLat,
  userLng,
  locationName,
  className = "",
}: LocationMapProps) {
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Dynamic import semua dependencies sekaligus
    const loadMapComponents = async () => {
      try {
        // Import Leaflet
        const leaflet = await import("leaflet");

        // Import react-leaflet components
        const reactLeaflet = await import("react-leaflet");

        // Fix default markers
        const DefaultIcon = leaflet.default.icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        leaflet.default.Marker.prototype.options.icon = DefaultIcon;

        setL(leaflet.default);
        setMapComponents(reactLeaflet);
      } catch (error) {
        console.error("Error loading map components:", error);
      }
    };

    loadMapComponents();
  }, []);

  // Show loading state jika components belum loaded
  if (!mapComponents || !L) {
    return (
      <div
        className={`h-64 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Memuat peta...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Circle, Marker, Popup } = mapComponents;

  // Custom icon untuk user location
  const userIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={16}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Area absensi circle */}
        <Circle
          center={[centerLat, centerLng]}
          radius={radius}
          fillColor="#3b82f6"
          fillOpacity={0.2}
          color="#3b82f6"
          weight={2}
        />

        {/* Center marker */}
        <Marker position={[centerLat, centerLng]}>
          <Popup>
            <div className="text-center">
              <strong>{locationName}</strong>
              <br />
              <small>Area absensi: {radius}m</small>
            </div>
          </Popup>
        </Marker>

        {/* User location marker */}
        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Lokasi Anda</strong>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export function LocationMap(props: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Pastikan hanya render di client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return loading state selama SSR
  if (!isMounted) {
    return (
      <div
        className={`h-64 bg-gray-100 rounded-lg flex items-center justify-center ${props.className}`}
      >
        <div className="text-center">
          <div className="animate-pulse w-12 h-12 bg-gray-300 rounded mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return <ClientOnlyMap {...props} />;
}
