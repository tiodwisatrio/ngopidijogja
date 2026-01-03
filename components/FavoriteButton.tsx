"use client";

import { useFavoriteContext } from "@/contexts/FavoriteContext";

interface FavoriteButtonProps {
  cafeId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function FavoriteButton({
  cafeId,
  size = "md",
  showText = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteContext();
  const favorited = isFavorite(cafeId);

  const sizeClasses = {
    sm: "p-1.5 text-lg",
    md: "p-2 text-xl",
    lg: "p-3 text-2xl",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(cafeId);
  };

  return (
    <button
      onClick={handleClick}
      className={`${
        sizeClasses[size]
      } rounded-full transition-all duration-200 ${
        favorited
          ? "text-red-500 bg-red-50 hover:bg-red-100"
          : "text-gray-400 bg-gray-100 hover:bg-gray-100 hover:text-gray-600"
      }`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? "❤️" : "🤍"}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {favorited ? "Tersimpan" : "Simpan"}
        </span>
      )}
    </button>
  );
}
