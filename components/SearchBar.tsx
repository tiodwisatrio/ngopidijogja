"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistance } from "@/lib/distance";

interface Facility {
  id: string;
  code: string;
  label: string;
  icon: string | null;
}

interface CafeFacility {
  facility: Facility;
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  facilities?: CafeFacility[];
  distance?: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterFacilities: (facilityIds: string[]) => void;
  onCafeSelect?: (cafeId: string) => void;
  onNearestToggle?: (userLocation: { lat: number; lng: number } | null) => void;
}

export default function SearchBar({
  onSearch,
  onFilterFacilities,
  onCafeSelect,
  onNearestToggle,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNearestActive, setIsNearestActive] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [visibleCafesCount, setVisibleCafesCount] = useState(10); // Incremental loading
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cafeListRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Cari coffeeshop favoritemu.....",
    "Cari tempat nugas terdekat.....",
    "Cari vibes healing favoritemu.....",
  ];

  // Fetch facilities and cafes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesRes, cafesRes] = await Promise.all([
          fetch("/api/facilities"),
          fetch("/api/cafes"),
        ]);

        if (facilitiesRes.ok) {
          const data = await facilitiesRes.json();
          setFacilities(Array.isArray(data) ? data : []);
        }

        if (cafesRes.ok) {
          const data = await cafesRes.json();
          setCafes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (searchQuery) return;

    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    let currentIndex = 0;
    let textIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const animate = () => {
      const currentText = placeholders[currentIndex];

      if (!isDeleting) {
        if (textIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, textIndex + 1));
          textIndex++;
          timeout = setTimeout(animate, typingSpeed);
        } else {
          timeout = setTimeout(animate, pauseTime);
          isDeleting = true;
        }
      } else {
        if (textIndex > 0) {
          setDisplayedText(currentText.slice(0, textIndex - 1));
          textIndex--;
          timeout = setTimeout(animate, deletingSpeed);
        } else {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % placeholders.length;
          timeout = setTimeout(animate, typingSpeed);
        }
      }
    };

    timeout = setTimeout(animate, typingSpeed);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setVisibleCafesCount(10); // Reset to 10 when search changes
  };

  const handleFacilityToggle = (facilityId: string) => {
    const newSelectedFacilities = selectedFacilities.includes(facilityId)
      ? selectedFacilities.filter((id) => id !== facilityId)
      : [...selectedFacilities, facilityId];

    setSelectedFacilities(newSelectedFacilities);
    onFilterFacilities(newSelectedFacilities);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    setVisibleCafesCount(10); // Reset to 10 when opening dropdown
  };

  const handleCafeClick = (cafe: Cafe) => {
    setSearchQuery(cafe.name);
    onSearch(cafe.name);
    setIsDropdownOpen(false);
    // Navigate to the cafe marker on the map
    onCafeSelect?.(cafe.id);
  };

  // Handle scroll for incremental loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPercentage =
      (target.scrollTop + target.clientHeight) / target.scrollHeight;

    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8) {
      setVisibleCafesCount((prev) => Math.min(prev + 10, filteredCafes.length));
    }
  };

  const handleNearestToggle = async () => {
    if (isNearestActive) {
      // Turn off nearest mode
      setIsNearestActive(false);
      onNearestToggle?.(null);
    } else {
      // Check browser support
      if (!navigator.geolocation) {
        alert("❌ Geolocation tidak didukung oleh browser Kamu");
        console.error("Geolocation API not supported");
        return;
      }

      // Check if running on HTTPS (required for geolocation)
      if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        alert("⚠️ Geolocation memerlukan HTTPS. Silakan akses via https://");
        console.error("Geolocation requires HTTPS");
        return;
      }

      setIsLoadingLocation(true);
      console.log("🔍 Requesting user location...");

      // Try with high accuracy first, fallback to low accuracy if timeout
      const tryGetLocation = (useHighAccuracy: boolean, timeoutMs: number) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: useHighAccuracy,
              timeout: timeoutMs,
              maximumAge: 0,
            }
          );
        });
      };

      // First attempt: High accuracy with 15s timeout
      tryGetLocation(true, 15000)
        .then((position) => {
          console.log("✅ Location obtained (high accuracy):", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setIsNearestActive(true);
          setIsLoadingLocation(false);
          onNearestToggle?.(userLocation);
        })
        .catch((error) => {
          // If high accuracy fails with timeout, try low accuracy
          if (error.code === 3) {
            console.log("⚠️ High accuracy timeout, trying low accuracy...");
            return tryGetLocation(false, 10000)
              .then((position) => {
                console.log("✅ Location obtained (low accuracy fallback):", {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                });

                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setIsNearestActive(true);
                setIsLoadingLocation(false);
                onNearestToggle?.(userLocation);
              })
              .catch((fallbackError) => {
                throw fallbackError; // Re-throw to main error handler
              });
          } else {
            throw error; // Not a timeout, throw to main error handler
          }
        })
        .catch((error) => {
          setIsLoadingLocation(false);

          // Detailed error logging
          console.error("❌ Geolocation error:", {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.code === 1,
            POSITION_UNAVAILABLE: error.code === 2,
            TIMEOUT: error.code === 3,
          });

          let message = "❌ Gagal mendapatkan lokasi Kamu";
          let details = "";

          switch (error.code) {
            case 1: // PERMISSION_DENIED
              message = "🚫 Izin Lokasi Ditolak";
              details = "Silakan aktifkan izin lokasi di pengaturan browser:\n\n" +
                "Chrome: Klik ikon gembok di address bar > Izinkan lokasi\n" +
                "Firefox: Klik ikon i di address bar > Permissions > Location\n" +
                "Safari: Settings > Privacy > Location Services";
              break;
            case 2: // POSITION_UNAVAILABLE
              message = "📍 Lokasi Tidak Tersedia";
              details = "GPS tidak dapat menentukan posisi Kamu. Pastikan:\n" +
                "• GPS/Location Services aktif di perangkat\n" +
                "• Tidak menggunakan VPN yang memblokir lokasi\n" +
                "• Sinyal GPS cukup kuat (coba di luar ruangan)";
              break;
            case 3: // TIMEOUT
              message = "⏱️ Waktu Habis";
              details = "GPS membutuhkan waktu lebih lama dari biasanya.\n\n" +
                "Tips:\n" +
                "• Coba di luar ruangan untuk sinyal GPS lebih baik\n" +
                "• Pastikan koneksi internet stabil\n" +
                "• Tunggu beberapa detik dan coba lagi\n" +
                "• Restart GPS di pengaturan perangkat";
              break;
            default:
              message = "❌ Error Tidak Diketahui";
              details = `Error code: ${error.code}\nMessage: ${error.message}`;
          }

          alert(`${message}\n\n${details}`);
        });
    }
  };

  // Filter cafes based on search query
  const filteredCafes = cafes.filter((cafe) =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 w-full px-4 pt-8 md:pt-4"
      style={{ zIndex: 9998 }}
      ref={dropdownRef}
    >
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Search Input Container - with semi-transparent background */}
        <div className="relative rounded-full bg-white transition-all duration-200">
          {/* Search Input */}
          <input
            type="text"
            placeholder={displayedText}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            className="relative z-10 w-full pl-4 pr-14 py-3 bg-transparent border border-gray-200 rounded-full focus:outline-none focus:none focus:bg-white text-[#803D3B] placeholder-[#803D3B] text-sm"
          />

          {/* Search Icon Button */}
          <button
            type="button"
            aria-label="Cari cafe"
            className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 bg-[#803D3B] hover:bg-[#6B3230] text-white rounded-full p-2 transition-colors w-10 h-10 flex items-center justify-center z-20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Dropdown - Interactive Search Results */}
          {isDropdownOpen && (
            <div
              className="dropdown-enter absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-h-96 overflow-y-auto"
              onScroll={handleScroll}
              ref={cafeListRef}
            >
              {/* Facilities Filter Section */}
              {facilities.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-[#803D3B] mb-2 uppercase tracking-wide">
                    Filter by Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, index) => (
                      <button
                        key={facility.id}
                        onClick={() => handleFacilityToggle(facility.id)}
                        className={`facility-filter-enter flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedFacilities.includes(facility.id)
                            ? "bg-[#FFD8D8] text-[#803D3B] scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95"
                        }`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {facility.icon && (
                          <span className="transition-transform duration-300 hover:scale-110">
                            {facility.icon}
                          </span>
                        )}
                        <span>{facility.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cafes List Section */}
              <div className="p-2">
                <div className="flex items-center justify-between mb-2 px-3">
                  <h3 className="text-xs font-semibold text-[#803D3B] uppercase tracking-wide">
                    {searchQuery ? "Search Results" : "All Cafes"}
                  </h3>
                  {filteredCafes.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Showing {Math.min(visibleCafesCount, filteredCafes.length)} of {filteredCafes.length}
                    </span>
                  )}
                </div>
                {filteredCafes.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCafes.slice(0, visibleCafesCount).map((cafe, index) => (
                      <button
                        key={cafe.id}
                        onClick={() => handleCafeClick(cafe)}
                        className="cafe-item-enter cursor-pointer w-full text-left px-3 py-2 rounded-lg hover:bg-[#FFF5F5] transition-all duration-300 group hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#803D3B] group-hover:text-[#6B3230] truncate transition-all duration-300 group-hover:translate-x-1">
                                {cafe.name}
                              </p>
                              {cafe.distance !== undefined && (
                                <span className="shrink-0 text-xs font-semibold text-white bg-[#803D3B] px-2 py-0.5 rounded-full">
                                  {formatDistance(cafe.distance)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate transition-all duration-300 group-hover:translate-x-1">
                              {cafe.address}
                            </p>
                          </div>
                          {cafe.facilities && cafe.facilities.length > 0 && (
                            <div className="flex gap-1 shrink-0">
                              {cafe.facilities
                                .slice(0, 3)
                                .map((cafeFacility, iconIndex) => (
                                  <span
                                    key={cafeFacility.facility.id}
                                    className="text-sm transition-all duration-300 group-hover:scale-105  cursor-pointer"
                                    style={{
                                      transitionDelay: `${iconIndex * 50}ms`,
                                    }}
                                  >
                                    {cafeFacility.facility.icon}
                                  </span>
                                ))}
                              {cafe.facilities.length > 3 && (
                                <span className="text-xs text-gray-400 transition-all duration-300 group-hover:scale-110">
                                  +{cafe.facilities.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Load More Indicator */}
                    {visibleCafesCount < filteredCafes.length && (
                      <div className="px-3 py-2 text-center">
                        <p className="text-xs text-[#803D3B] font-medium animate-pulse">
                          Scroll untuk melihat lebih banyak...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 px-3 py-4 text-center opacity-0 cafe-item-enter">
                    No cafes found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Facility Filter Chips - Only show when dropdown is closed */}
        {!isDropdownOpen && facilities.length > 0 && (
          <div className="overflow-x-auto py-2 scrollbar-hide -mx-4 px-4">
            <div className="flex flex-col gap-2 pb-1 w-max">
              <div className="flex gap-2">
                {/* Nearest Location Button */}
                <button
                  onClick={handleNearestToggle}
                  disabled={isLoadingLocation}
                  className={`filter-chip-enter flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isNearestActive
                      ? "bg-[#FFD8D8] scale-105 ring-2 ring-[#803D3B]/30"
                      : isLoadingLocation
                      ? "bg-gray-100 cursor-wait"
                      : "bg-white hover:bg-gray-50  hover:scale-105 active:scale-95"
                  }`}
                  style={{ animationDelay: "0ms" }}
                >
                  <span className="transition-transform duration-300 hover:rotate-12 hover:scale-110">
                    {isLoadingLocation ? "⏳" : "📍"}
                  </span>
                  <span className="text-[#803D3B]">
                    {isLoadingLocation ? "Memuat..." : "Terdekat"}
                  </span>
                </button>

                {facilities
                  .slice(0, Math.ceil(facilities.length / 2))
                  .map((facility, index) => (
                    <button
                      key={facility.id}
                      onClick={() => handleFacilityToggle(facility.id)}
                      className={`filter-chip-enter flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedFacilities.includes(facility.id)
                          ? "bg-[#FFD8D8] scale-105"
                          : "bg-white hover:bg-gray-50 hover:shadow-lg hover:scale-105 active:scale-95"
                      }`}
                      style={{ animationDelay: `${(index + 1) * 40}ms` }}
                    >
                      {facility.icon && (
                        <span className="transition-transform duration-300 hover:rotate-12 hover:scale-110">
                          {facility.icon}
                        </span>
                      )}
                      <span className="text-[#803D3B]">{facility.label}</span>
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                {facilities
                  .slice(Math.ceil(facilities.length / 2))
                  .map((facility, index) => (
                    <button
                      key={facility.id}
                      onClick={() => handleFacilityToggle(facility.id)}
                      className={`filter-chip-enter flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedFacilities.includes(facility.id)
                          ? "bg-[#FFD8D8] scale-105 "
                          : "bg-white hover:bg-gray-50 hover:shadow-lg hover:scale-105 active:scale-95"
                      }`}
                      style={{
                        animationDelay: `${
                          (index + Math.ceil(facilities.length / 2)) * 40
                        }ms`,
                      }}
                    >
                      {facility.icon && (
                        <span className="transition-transform duration-300 hover:rotate-12 hover:scale-110">
                          {facility.icon}
                        </span>
                      )}
                      <span className="text-[#803D3B]">{facility.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
