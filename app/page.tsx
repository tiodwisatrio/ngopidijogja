"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import NavigationMenu from "@/components/NavigationMenu";
import { calculateDistance } from "@/lib/distance";

declare global {
  interface Window {
    __showCafeDetail?: (cafeId: string) => void;
  }
}

// Dynamic imports for better code splitting and lazy loading
const CafeMap = dynamic(() => import("@/components/CafeMap"), { ssr: false });
const CafeDetailSheet = dynamic(() => import("@/components/CafeDetailSheet"));
const AboutModal = dynamic(() => import("@/components/AboutModal"));
const DeveloperModal = dynamic(() => import("@/components/DeveloperModal"));

interface PaymentMethod {
  paymentMethod: {
    code: string;
    label: string;
  };
}

interface CafeImage {
  id: string;
  imageUrl: string;
  alt: string | null;
}

interface OpeningHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  isEverydayOpen: boolean;
  isOpen24Hours: boolean;
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
  instagramUsername?: string | null;
  instagramUrl?: string | null;
  latitude: number | null;
  longitude: number | null;
  parking: string | null;
  slug: string;
  googleMapsUrl?: string;
  paymentMethods?: PaymentMethod[];
  mainImageId?: string | null;
  images?: CafeImage[];
  openingHours?: OpeningHour[];
  facilities?: Facility[];
  distance?: number;
}

export default function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState<string>("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

  // Fetch cafes on mount
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const res = await fetch("/api/cafes");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCafes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load cafes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  // Filter logic (CLIENT-SIDE) - Memoized for better performance
  const filteredCafes = useMemo(() => {
    let result = cafes;

    // Search by name
    if (searchQuery) {
      result = result.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected facilities (cafe must have ALL selected facilities)
    if (selectedFacilityIds.length > 0) {
      result = result.filter((cafe) => {
        // Get facility IDs for this cafe
        const cafeFacilityIds =
          cafe.facilities?.map((f) => f.facility.id) || [];

        // Check if cafe has all selected facilities
        return selectedFacilityIds.every((selectedId) =>
          cafeFacilityIds.includes(selectedId)
        );
      });
    }

    // Only show cafes with valid coordinates
    result = result.filter((cafe) => cafe.latitude && cafe.longitude);

    // Calculate distances if user location is available
    if (userLocation) {
      result = result.map((cafe) => ({
        ...cafe,
        distance:
          cafe.latitude && cafe.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                cafe.latitude,
                cafe.longitude
              )
            : undefined,
      }));

      // Sort by distance (nearest first)
      result.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }, [searchQuery, selectedFacilityIds, cafes, userLocation]);

  // Expose function to window for popup button clicks
  useEffect(() => {
    const showDetail = (cafeId: string) => {
      console.log('showDetail called with ID:', cafeId, 'type:', typeof cafeId);
      console.log('Available cafe IDs:', filteredCafes.map(c => `${c.id} (${typeof c.id})`));

      // Try both string and number comparison
      const cafe = filteredCafes.find((c) => String(c.id) === String(cafeId));

      if (cafe) {
        console.log('Cafe found:', cafe.name);

        // Open modal IMMEDIATELY with basic data (instant feedback!)
        setSelectedCafe(cafe);
        setIsDetailSheetOpen(true);

        // Then fetch full data in background (images will appear smoothly)
        fetch(`/api/cafes/${cafe.id}`)
          .then(res => res.json())
          .then(data => {
            // Update with full data (including images)
            setSelectedCafe(data);
          })
          .catch(err => {
            console.error('Failed to fetch full cafe data:', err);
            // Modal already open with basic data, so it's fine
          });
      } else {
        console.warn('Cafe not found with ID:', cafeId);
      }
    };

    if (typeof window !== "undefined") {
      window.__showCafeDetail = showDetail;
    }

    return () => {
      if (typeof window !== "undefined") {
        window.__showCafeDetail = undefined;
      }
    };
  }, [filteredCafes]);

  return (
    <>
      {/* Search Bar with Filters */}
      <SearchBar
        onSearch={setSearchQuery}
        onFilterFacilities={setSelectedFacilityIds}
        onCafeSelect={setSelectedCafeId}
        onNearestToggle={setUserLocation}
      />

      {/* Main Content */}
      <main className="h-screen flex flex-col bg-white relative">
        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center bg-[#fbe5e5]">
            <div className="text-center">
              <div className="inline-block w-10 h-10 border-3 border-[#FFD8D8] border-t-[#803D3B] rounded-full animate-spin mb-2"></div>
              <p className="text-[#803D3B] text-sm font-medium">Loading...</p>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredCafes.length === 0 && (
          <div className="flex-1 flex items-center justify-center bg-[#fbe5e5]">
            <div className="text-center">
              <div className="text-3xl mb-2">😕</div>
              <p className="text-[#803D3B] font-medium">
                Coffeeshop tidak ditemukan
              </p>
              <p className="text-[#803D3B] text-xs mt-1">
                Coba sesuaikan pencarian Kamu ya!
              </p>
            </div>
          </div>
        )}

        {/* Map Container */}
        {!loading && filteredCafes.length > 0 && (
          <div className="flex-1 relative overflow-hidden">
            <CafeMap
              cafes={filteredCafes}
              selectedCafeId={selectedCafeId}
              onCafeClick={(cafe) => setSelectedCafeId(cafe.id)}
              userLocation={userLocation}
            />

            {/* Result Counter */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 border border-amber-100">
              <p className="text-amber-900 font-medium text-xs">
                {filteredCafes.length} cafe
                {filteredCafes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Cafe Detail Bottom Sheet */}
      <CafeDetailSheet
        cafe={selectedCafe}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        onAboutClick={() => setIsAboutModalOpen(true)}
        onDeveloperClick={() => setIsDeveloperModalOpen(true)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Developer Modal */}
      <DeveloperModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
      />
    </>
  );
}
