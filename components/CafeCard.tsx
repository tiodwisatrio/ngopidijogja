"use client";

import Image from "next/image";
import { useState } from "react";
import FavoriteButton from "./FavoriteButton";

interface Cafe {
  id: string;
  slug: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  parking: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceRange?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  instagramUsername?: string | null;
  mainImageId?: string | null;
  images?: {
    id: string;
    imageUrl: string;
    alt: string | null;
  }[];
}

interface CafeCardProps {
  cafe: Cafe;
  onClick?: () => void;
}

export default function CafeCard({ cafe, onClick }: CafeCardProps) {
  const [imageError, setImageError] = useState(false);

  const mainImage = cafe.images?.find((img) => img.id === cafe.mainImageId) || cafe.images?.[0];
  const imageUrl = mainImage?.imageUrl || "/placeholder-cafe.jpg";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {!imageError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={mainImage?.alt || cafe.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#803D3B] to-[#6d342f]">
            <span className="text-white text-4xl">☕</span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton cafeId={cafe.id} size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#803D3B] mb-1 line-clamp-1">
          {cafe.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {cafe.address}
        </p>

        {/* Price Range */}
        {cafe.priceMin && cafe.priceMax && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-gray-700">
              Rp {cafe.priceMin.toLocaleString("id-ID")} - {cafe.priceMax.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {cafe.parking && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>🅿️</span>
              <span>{cafe.parking}</span>
            </div>
          )}

          {cafe.googleMapsUrl && (
            <a
              href={cafe.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-[#803D3B] hover:text-[#6d342f] font-medium flex items-center gap-1"
            >
              <span>📍</span>
              <span>Maps</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
