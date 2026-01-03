"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FavoriteContextType {
  favoriteCafes: string[];
  addFavorite: (cafeId: string) => void;
  removeFavorite: (cafeId: string) => void;
  isFavorite: (cafeId: string) => boolean;
  toggleFavorite: (cafeId: string) => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favoriteCafes, setFavoriteCafes] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favoriteCafes");
    if (saved) {
      try {
        setFavoriteCafes(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse favorites from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("favoriteCafes", JSON.stringify(favoriteCafes));
    }
  }, [favoriteCafes, isLoaded]);

  const addFavorite = (cafeId: string) => {
    setFavoriteCafes((prev) => {
      if (prev.includes(cafeId)) return prev;
      return [...prev, cafeId];
    });
  };

  const removeFavorite = (cafeId: string) => {
    setFavoriteCafes((prev) => prev.filter((id) => id !== cafeId));
  };

  const isFavorite = (cafeId: string) => {
    return favoriteCafes.includes(cafeId);
  };

  const toggleFavorite = (cafeId: string) => {
    if (isFavorite(cafeId)) {
      removeFavorite(cafeId);
    } else {
      addFavorite(cafeId);
    }
  };

  return (
    <FavoriteContext.Provider
      value={{
        favoriteCafes,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavoriteContext() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavoriteContext must be used within FavoriteProvider");
  }
  return context;
}
