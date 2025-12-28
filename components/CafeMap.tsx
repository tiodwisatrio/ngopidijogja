"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance } from "@/lib/distance";

interface PaymentMethod {
  paymentMethod: {
    code: string;
    label: string;
  };
}

interface Facility {
  facility: {
    id: string;
    code: string;
    label: string;
    icon: string | null;
  };
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  parking: string | null;
  slug: string;
  googleMapsUrl?: string;
  paymentMethods?: PaymentMethod[];
  facilities?: Facility[];
  distance?: number;
}

interface CafeMapProps {
  cafes: Cafe[];
  selectedCafeId?: string;
  onCafeClick?: (cafe: Cafe) => void;
  onShowDetail?: (cafe: Cafe) => void;
}

const YOGYAKARTA_CENTER: [number, number] = [-7.7975, 110.3695];

export default function CafeMap({
  cafes,
  selectedCafeId,
  onCafeClick,
  onShowDetail,
}: CafeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const popupCacheRef = useRef<Map<string, string>>(new Map());

  // Memoize marker icon untuk menghindari recreate
  const markerIcon = useMemo(() => {
    return L.divIcon({
      html: `
        <div class="cafe-marker-container">
          <div class="cafe-marker-ripple"></div>
          <div class="cafe-marker-circle">
            <span class="cafe-marker-icon">☕</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -70],
      className: "cafe-marker",
    });
  }, []);

  // Callback untuk generate popup content (cached)
  const getPopupContent = useCallback((cafe: Cafe): string => {
    // Check cache first
    const cacheKey = `${cafe.id}-${cafe.distance}`;
    const cached = popupCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const facilities = cafe.facilities ? cafe.facilities.slice(0, 4) : [];
    const parking = cafe.parking ? cafe.parking.split(", ") : [];
    const payments = cafe.paymentMethods || [];

    const parkingIcons: { [key: string]: string } = {
      Motor: "🏍️",
      Mobil: "🚗",
    };

    const getPaymentIcon = (paymentLabel: string): string => {
      const label = paymentLabel.toLowerCase();

      if (label.includes("cash") || label.includes("tunai")) {
        return "💵";
      }
      if (label.includes("qris") || label.includes("qr")) {
        return "📱";
      }
      if (
        label.includes("debit") ||
        label.includes("kredit") ||
        label.includes("card") ||
        label.includes("kartu")
      ) {
        return "💳";
      }
      if (
        label.includes("gopay") ||
        label.includes("ovo") ||
        label.includes("dana") ||
        label.includes("shopeepay")
      ) {
        return "📱";
      }

      return "💰";
    };

    // Check if cafe is WFC-Friendly (Wi-Fi + Colokan + Toilet)
    const isWFCFriendly = (cafe: Cafe): boolean => {
      if (!cafe.facilities || cafe.facilities.length === 0) return false;

      const facilityLabels = cafe.facilities.map((f) =>
        f.facility.label.toLowerCase()
      );

      const hasWifi = facilityLabels.some(
        (label) => label.includes("wifi") || label.includes("wi-fi")
      );
      const hasColokan = facilityLabels.some(
        (label) =>
          label.includes("colokan") ||
          label.includes("charging") ||
          label.includes("charger")
      );
      const hasToilet = facilityLabels.some((label) =>
        label.includes("toilet")
      );

      return hasWifi && hasColokan && hasToilet;
    };

    const content = `
      <div style="width: 100%; max-width: 280px; padding: 0; border-radius: 10px; overflow: hidden; box-sizing: border-box;">
        <div style="padding: 12px; background-color: #fff; box-sizing: border-box;">
          <h3 style="margin: 0 0 3px 0; color: #803D3B; font-size: 15px; font-weight: 700; line-height: 1.3;">
            ${cafe.name}
          </h3>
          ${
            isWFCFriendly(cafe)
              ? `<div style="margin: 0 0 8px 0;">
                  <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                    💼 WFC-Friendly
                  </span>
                </div>`
              : ""
          }
          <div style="margin: 0 0 10px 0; display: flex; align-items: flex-start; gap: 6px;">
            <p style="margin: 0; color: #666; font-size: 10px; line-height: 1.3; flex: 1;">
              ${cafe.address}
            </p>
            ${
              cafe.distance !== undefined
                ? `<span style="background-color: #803D3B; color: white; padding: 2px 6px; border-radius: 8px; font-size: 9px; font-weight: 600; white-space: nowrap; flex-shrink: 0;">${formatDistance(
                    cafe.distance
                  )}</span>`
                : ""
            }
          </div>
          ${
            parking.length > 0
              ? `<div style="margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #333; font-size: 11px; font-weight: 600;">Parkir</p>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${parking
                    .map(
                      (p) =>
                        `<span style="background-color: #E3F2FD; color: #1565C0; padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: 600;">${
                          parkingIcons[p.trim()] || "🅿️"
                        } ${p.trim()}</span>`
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }
          ${
            payments.length > 0
              ? `<div style="margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #333; font-size: 11px; font-weight: 600;">Pembayaran</p>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${payments
                    .map(
                      (pm) =>
                        `<span style="background-color: #F3E5F5; color: #6A1B9A; padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: 600;">${getPaymentIcon(
                          pm.paymentMethod.label
                        )} ${pm.paymentMethod.label}</span>`
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }
          ${
            facilities.length > 0
              ? `<div style="margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #333; font-size: 11px; font-weight: 600;">Fasilitas</p>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${facilities
                    .map(
                      (f) =>
                        `<span style="background-color: #E8F5E9; color: #2E7D32; padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: 600;">${
                          f.facility.icon || "✓"
                        } ${f.facility.label}</span>`
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }
          <div style="display: flex; gap: 6px; margin-top: 6px; width: 100%;">
            <button style="flex: 1; background: #803D3B !important; color: white !important; border: none !important; padding: 8px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; box-sizing: border-box; text-decoration: none; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif;" onmouseover="this.style.setProperty('background', '#6B3230', 'important')" onmouseout="this.style.setProperty('background', '#803D3B', 'important')" onclick="window.__showCafeDetail && window.__showCafeDetail('${String(
              cafe.id
            )}'); event.stopPropagation();">
              Lihat Detail
            </button>
            ${
              cafe.googleMapsUrl
                ? `<a href="${cafe.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="width: 36px; height: 36px; background-color: transparent; color: #803D3B; border: 1px solid #FFD8D8; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background-color 0.2s; box-sizing: border-box; text-decoration: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" onmouseover="this.style.backgroundColor='rgba(128, 61, 59, 0.05)'" onmouseout="this.style.backgroundColor='transparent'">📍</a>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    // Cache the content
    popupCacheRef.current.set(cacheKey, content);
    return content;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map", {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // Use canvas rendering for better performance
      }).setView(YOGYAKARTA_CENTER, 13);

      // CartoDB Positron - Minimalist & Modern Style
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          // Performance optimizations
          keepBuffer: 2, // Keep 2 screens of tiles in memory
          updateWhenIdle: false, // Update while panning (smoother UX)
          updateWhenZooming: false, // Skip updates during zoom
          // Force non-retina tiles even on high DPI displays
          detectRetina: false, // CRITICAL: Prevent loading @2x tiles
          // Caching
          crossOrigin: true,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
        }
      ).addTo(map);

      // Custom zoom control styling
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      // Don't destroy map on unmount
    };
  }, []);

  // Add/Update markers (OPTIMIZED)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const newMarkerIds = new Set<string>();

    cafes.forEach((cafe) => {
      if (!cafe.latitude || !cafe.longitude) return;

      newMarkerIds.add(cafe.id);
      const existingMarker = markersRef.current.get(cafe.id);

      if (existingMarker) {
        // Update position if changed
        existingMarker.setLatLng([cafe.latitude, cafe.longitude]);

        // Update popup content if distance changed (for nearest mode)
        if (cafe.distance !== undefined) {
          const popupContent = getPopupContent(cafe);
          existingMarker.setPopupContent(popupContent);
        }
      } else {
        // Create new marker dengan icon yang sudah di-memoize
        const marker = L.marker([cafe.latitude, cafe.longitude], {
          icon: markerIcon,
        }).addTo(map);

        // Bind popup dengan content dari cache
        const popupContent = getPopupContent(cafe);
        marker.bindPopup(popupContent, {
          maxWidth: 280,
          minWidth: 240,
          className: "cafe-popup-gmap",
          closeButton: false,
          autoPan: true,
          autoPanPadding: [10, 10],
          offset: L.point(0, -5),
        });

        marker.on("click", () => {
          onCafeClick?.(cafe);
        });

        markersRef.current.set(cafe.id, marker);
      }
    });

    // Remove markers not in list
    markersRef.current.forEach((marker, cafeId) => {
      if (!newMarkerIds.has(cafeId)) {
        map.removeLayer(marker);
        markersRef.current.delete(cafeId);
        // Clear cache for removed cafe
        popupCacheRef.current.delete(cafeId);
      }
    });
  }, [cafes, onCafeClick, markerIcon, getPopupContent]);

  // Highlight selected cafe
  useEffect(() => {
    if (!selectedCafeId) return;

    const marker = markersRef.current.get(selectedCafeId);
    if (marker && mapRef.current) {
      const latLng = marker.getLatLng();
      mapRef.current.setView(latLng, 15);
      marker.openPopup();
    }
  }, [selectedCafeId]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}
