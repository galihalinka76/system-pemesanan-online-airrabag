"use client";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Search, Map as MapIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// WAJIB IMPORT CSS Leaflet
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Komponen untuk menangani pergerakan kamera dan perbaikan "Peta Abu-abu"
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    // Memaksa peta menghitung ulang ukuran kontainer agar tidak abu-abu
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);

  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);

  return null;
}

interface MapSectionProps {
  position: [number, number];
  address: string;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function MapSection({ position, onLocationSelect }: MapSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = async (query: string) => {
    if (query.length < 3) return;
    setIsSearching(true);
    try {
      // Menambahkan email di query adalah syarat "Friendly Policy" Nominatim agar tidak mudah kena blokir
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'id',
          'User-Agent': 'MaRuf-Fullstack-App' // Ganti dengan nama app kamu agar tidak di-block
        }
      });

      if (!res.ok) throw new Error("Blocked by provider");
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Search error:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3) executeSearch(searchQuery);
    }, 1000); // Naikkan delay ke 1 detik agar lebih aman
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const LocationMarker = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'User-Agent': 'MaRuf-Fullstack-App' } }
          );
          const data = await res.json();
          onLocationSelect(lat, lng, data.display_name || "Unknown Location");
        } catch (err) {
          onLocationSelect(lat, lng, "Location found (Archive Mode)");
        }
      },
    });
    return <Marker position={position} icon={customIcon} />;
  };

  return (
    <div className="relative w-full group">
      {/* SEARCH INTERFACE */}
      <div className="absolute top-4 left-4 right-4 z-[1001] space-y-2">
        <div className="relative flex items-center">
          <div className="absolute  p-1 bg-[#062C2C] rounded-lg text-[#B6AB91]">
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </div>
          <input
            type="text"
            placeholder="Ketik alamat lengkap / nomor rumah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl text-[11px] font-bold focus:ring-2 focus:ring-[#062C2C] outline-none"
          />
        </div>
        
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-52 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onLocationSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
                  setSearchResults([]);
                  setSearchQuery("");
                }}
                className="px-5 py-3 text-[10px] font-bold text-gray-600 hover:bg-[#062C2C] hover:text-white cursor-pointer border-b last:border-none"
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP VIEWPORT */}
      <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10">
        <MapContainer 
          center={position} 
          zoom={19} 
          maxZoom={20}
          scrollWheelZoom={true} 
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer 
            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution="&copy; Google Maps Satellite"
          />
          <ZoomControl position="bottomright" />
          <MapController center={position} />
          <LocationMarker />
        </MapContainer>

        <div className="absolute bottom-6 left-8 z-[1001] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3 border border-gray-100">
            <MapIcon size={14} className="text-[#062C2C]" />
            <span className="text-[9px] font-black text-[#062C2C] uppercase tracking-[0.2em]">High-Res Satellite Active</span>
        </div>
      </div>
    </div>
  );
}