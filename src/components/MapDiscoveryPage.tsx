// src/components/MapDiscoveryPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Store, Navigation, X } from 'lucide-react';
import { Business } from '../types/business';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useBusinessStore } from '../store/businessStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 1.3521, lng: 103.8198 }; // Singapore fallback

export function MapDiscoveryPage() {
  const navigate = useNavigate();
  const businesses = useBusinessStore((state) => state.businesses);
  const setSelectedBusiness = useBusinessStore((state) => state.setSelectedBusiness);
  const logout = useAuthStore((state) => state.logout);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  const safeBusinesses: Business[] = Array.isArray(businesses) ? businesses : [];

  // Styling tokens
  const pageBg = isDarkMode ? '#3a3a3a' : '#f9fafb';
  const panelBg = isDarkMode ? '#2a2a2a' : '#ffffff';
  const railBg = isDarkMode ? '#3a3a3a' : '#f9fafb';
  const borderTone = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textMain = isDarkMode ? 'text-white' : 'text-black';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputText = isDarkMode ? 'text-white placeholder:text-gray-400' : 'text-black placeholder:text-gray-500';

  // Local states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPin, setSelectedPin] = useState<Business | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [businessesWithCoords, setBusinessesWithCoords] = useState<
    (Business & { lat?: number; lng?: number })[]
  >([]);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCn-aVVBxUbCBYihIeKHePKcTq7O4KfMlY',
  });

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation failed:', err)
      );
    }
  }, []);

  // Detect screen size for responsive padding
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Geocode businesses' addresses
  useEffect(() => {
    if (!isLoaded || !safeBusinesses.length) return;
    const geocoder = new (window as any).google.maps.Geocoder();

    const geocodeAll = async () => {
      const results: (Business & { lat?: number; lng?: number })[] = [];

      await Promise.all(
        safeBusinesses.map(async (b) => {
          const address = (b as any).address || '';
          if (!address) return results.push(b as any);

          const res: any = await new Promise((resolve) => {
            geocoder.geocode({ address }, (geoResults: any, status: any) => {
              if (status === 'OK' && geoResults[0]) {
                const loc = geoResults[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
              } else {
                resolve(null);
              }
            });
          });

          if (res) results.push({ ...(b as any), lat: res.lat, lng: res.lng });
          else results.push(b as any);
        })
      );

      setBusinessesWithCoords(results);
    };

    geocodeAll();
  }, [isLoaded, safeBusinesses]);

  // Filtered businesses by search term
  const filtered = (searchTerm
    ? businessesWithCoords.filter((b) => {
        const q = searchTerm.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          (b.category ?? '').toLowerCase().includes(q) ||
          (b.address ?? '').toLowerCase().includes(q) ||
          (b.description ?? '').toLowerCase().includes(q)
        );
      })
    : businessesWithCoords
  ).slice(0, 50);

  // Compute nearest businesses to user
  const nearestUENs = new Set<string>();
  if (userLocation) {
    const distances = businessesWithCoords
      .map((b) => ({
        uen: (b as any).uen ?? b.id,
        distance:
          b.lat && b.lng
            ? haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
            : Infinity,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map((x) => x.uen);
    nearestUENs.clear();
    distances.forEach((uen) => nearestUENs.add(uen));
  }

  // Navigation handlers
  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    navigate(`/business/${business.id}`);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  if (loadError) return <div className="text-red-500">Map cannot load</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="h-screen w-full flex flex-col" style={{ backgroundColor: pageBg }}>
      {/* MAP SECTION */}
      <div className="relative flex-1 overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={userLocation ? 16 : 14}
          center={userLocation ?? defaultCenter}
        >
          {/* User marker with green pin and popup */}
          {userLocation && (
            <>
              <Marker
                position={userLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                }}
                onClick={() => setShowUserInfo(true)}
              />
              {showUserInfo && (
                <InfoWindow
                  position={userLocation}
                  onCloseClick={() => setShowUserInfo(false)}
                >
                  <div className="text-sm font-medium text-gray-800">You are here</div>
                </InfoWindow>
              )}
            </>
          )}

          {/* Business pins */}
          {businessesWithCoords.map((b) => {
            if (b.lat === undefined || b.lng === undefined) return null;

            const isSelected = selectedPin?.id === b.id;
            const isNearest = nearestUENs.has((b as any).uen ?? b.id);

            let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            if (isNearest) iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            if (isSelected) iconUrl = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';

            return (
              <Marker
                key={String(b.id)}
                position={{ lat: b.lat, lng: b.lng }}
                onClick={() => setSelectedPin(b)}
                icon={{ url: iconUrl }}
              />
            );
          })}
        </GoogleMap>

        {/* Selected-pin mini card with distance */}
        {selectedPin && (
          <div className="absolute bottom-6 left-6 z-10 max-w-sm">
            <Card className={`p-4 ${borderTone}`} style={{ backgroundColor: panelBg }}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-lg font-semibold ${textMain}`}>{selectedPin.name}</h3>
                    <Button
                      size="icon"
                      variant="outline"
                      className={`${borderTone} ${
                        isDarkMode ? 'text-white hover:bg-neutral-800' : 'text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPin(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={`mt-1 text-sm ${textMuted}`}>
                    {selectedPin.category}
                    {selectedPin.priceRange ? ` · ${selectedPin.priceRange}` : ''}
                  </div>
                  {selectedPin.address && (
                    <div className={`mt-1 text-xs ${textMuted}`}>{selectedPin.address}</div>
                  )}

                  {/* Distance line */}
                  {userLocation && selectedPin.lat && selectedPin.lng && (
                    <div className={`mt-1 text-xs ${textMuted}`}>
                      {haversineDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedPin.lat,
                        selectedPin.lng
                      ).toFixed(2)}{' '}
                      km away
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      onClick={() => handleBusinessClick(selectedPin)}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* LOWER PANEL */}
      <div
        className={`shrink-0 border-t ${borderTone}`}
        style={{ backgroundColor: railBg, height: '52vh', paddingLeft: isDesktop ? 'var(--rail-w, 64px)' : '0' }} 
      >
        <div className="max-w-none mx-auto h-full flex flex-col gap-3 px-4 pt-4 pb-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search businesses…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 h-10 border-none rounded-full text-sm ${inputText}`}
                style={{ backgroundColor: panelBg }}
              />
            </div>
            <div className={`mt-2 text-xs ${textMuted}`}>
              {searchTerm.trim()
                ? `Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                : `${safeBusinesses.length} businesses nearby`}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => (
                <Card key={b.id} className={`p-4 hover:shadow ${borderTone}`} style={{ backgroundColor: panelBg }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Store className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={`text-base font-semibold ${textMain}`}>{b.name}</h3>
                        {b.category && <Badge variant="secondary">{b.category}</Badge>}
                      </div>
                      <div className={`mt-1 text-sm ${textMuted}`}>
                        {(b.priceRange ? `${b.priceRange} · ` : '') + (b.address ?? '')}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          onClick={() => handleBusinessClick(b)}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          View details
                        </Button>
                        <Button
                          onClick={() => setSelectedPin(b)}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          Show on map
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className={`text-sm py-8 text-center ${textMuted}`}>No results.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}