"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useFavoriteContext } from "@/contexts/FavoriteContext";
import CafeCard from "@/components/CafeCard";
import Link from "next/link";

// Dynamic import for CafeDetailSheet
const CafeDetailSheet = dynamic(() => import("@/components/CafeDetailSheet"));

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
  slug: string;
  name: string;
  address: string;
  instagramUsername?: string | null;
  instagramUrl?: string | null;
  latitude: number | null;
  longitude: number | null;
  parking: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceRange?: string | null;
  googleMapsUrl?: string | null;
  paymentMethods?: PaymentMethod[];
  mainImageId?: string | null;
  images?: CafeImage[];
  openingHours?: OpeningHour[];
  facilities?: Facility[];
}

export default function FavoritesPage() {
  const { favoriteCafes } = useFavoriteContext();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  useEffect(() => {
    fetchFavoriteCafes();
  }, [favoriteCafes]);

  const fetchFavoriteCafes = async () => {
    if (favoriteCafes.length === 0) {
      setCafes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Filter cafes based on favorite IDs
      const allCafes = Array.isArray(data) ? data : [];
      const filteredCafes = allCafes.filter((cafe: Cafe) =>
        favoriteCafes.includes(cafe.id)
      );

      setCafes(filteredCafes);
    } catch (error) {
      console.error("Failed to fetch cafes:", error);
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#803D3B] to-[#6d342f] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </Link>

          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-bold">Favorite</h1>
          </div>
          <p className="text-white/80 text-lg">
            {favoriteCafes.length} cafe tersimpan di daftar favorit
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Content */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#803D3B] rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-500 text-lg">Memuat cafe favorit...</p>
          </div>
        ) : cafes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 mb-8 rounded-full bg-gray-50 flex items-center justify-center">
              <div className="text-7xl">🤍</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Belum ada cafe favorit
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md text-center">
              Mulai eksplorasi dan simpan cafe favorit kamu dengan menekan
              tombol ❤️
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#803D3B] text-white rounded-xl hover:bg-[#6d342f] transition-all hover:shadow-lg font-medium text-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Jelajahi Cafe
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 pb-6 border-b border-gray-100">
              <p className="text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold text-[#803D3B]">
                  {cafes.length}
                </span>{" "}
                cafe favorit
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cafes.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  cafe={cafe}
                  onClick={() => {
                    // Open modal immediately with basic data
                    setSelectedCafe(cafe);
                    setIsDetailSheetOpen(true);

                    // Fetch full data in background
                    fetch(`/api/cafes/${cafe.id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setSelectedCafe(data);
                      })
                      .catch((err) => {
                        console.error("Failed to fetch full cafe data:", err);
                      });
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cafe Detail Bottom Sheet */}
      <CafeDetailSheet
        cafe={selectedCafe}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
      />
    </div>
  );
}
