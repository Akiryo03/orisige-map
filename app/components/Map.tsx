'use client';

import { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import { Location } from '@/app/types';
import LocationMarker from './LocationMarker';

interface MapProps {
  locations: Location[];
  apiKey: string;
  selectedLocation?: Location | null;
}

function MapContent({ locations, selectedLocation }: Omit<MapProps, 'apiKey'>) {
  const map = useMap();
  const defaultCenter = {
    lat: 35.9564,
    lng: 140.3189,
  };

  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);
  const [isLocating, setIsLocating] = useState(false);

  // すべてのマーカーが見えるように地図をフィット
  useEffect(() => {
    if (map && locations.length > 0 && !selectedLocation) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend({
          lat: location.latitude,
          lng: location.longitude,
        });
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, locations, selectedLocation]);

  // 選択された場所に地図の中心を移動
  useEffect(() => {
    if (selectedLocation && map) {
      map.panTo({
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude,
      });
      map.setZoom(15);
    }
  }, [selectedLocation, map]);

  // 現在地を取得して地図を移動
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.panTo(currentPos);
          map.setZoom(14);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('位置情報の取得に失敗しました:', error);
        alert('位置情報の取得に失敗しました。位置情報の利用を許可してください。');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map]);

  return (
    <>
      <GoogleMap
        center={center}
        zoom={zoom}
        onCenterChanged={(e) => setCenter(e.detail.center)}
        onZoomChanged={(e) => setZoom(e.detail.zoom)}
        mapId="orisige-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {locations.map((location) => (
          <LocationMarker key={location.id} location={location} />
        ))}
      </GoogleMap>

      {/* 現在地ボタン */}
      <button
        onClick={handleCurrentLocation}
        disabled={isLocating}
        className="absolute bottom-6 right-6 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 text-[#8b2635] px-4 py-3 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 font-medium text-sm transition-all disabled:cursor-not-allowed z-10"
        aria-label="現在地を表示"
      >
        {isLocating ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>取得中...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
            <span>現在地</span>
          </>
        )}
      </button>
    </>
  );
}

export default function Map({ locations, apiKey, selectedLocation }: MapProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[calc(100vh-200px)] min-h-[400px] max-h-[800px] relative">
        <MapContent locations={locations} selectedLocation={selectedLocation} />
      </div>
    </APIProvider>
  );
}
