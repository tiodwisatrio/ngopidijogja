"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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
  priceMin?: number | null;
  priceMax?: number | null;
  priceRange?: string | null;
  slug: string;
  googleMapsUrl?: string;
  paymentMethods?: PaymentMethod[];
  mainImageId?: string | null;
  images?: CafeImage[];
  openingHours?: OpeningHour[];
  facilities?: Facility[];
}

interface CafeDetailSheetProps {
  cafe: Cafe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CafeDetailSheet({
  cafe,
  isOpen,
  onClose,
}: CafeDetailSheetProps) {
  // No need for cafe state - data is already prefetched by parent
  const facilities = cafe?.facilities || [];
  const parking = cafe?.parking ? cafe.parking.split(", ") : [];
  const payments = cafe?.paymentMethods || [];

  // State untuk selected image ID
  const [selectedImageId, setSelectedImageId] = useState<string>(
    () => cafe?.mainImageId || cafe?.images?.[0]?.id || cafe?.mainImageId || cafe?.images?.[0]?.id || ""
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // State untuk drag gesture
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // State untuk lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxTouchStart, setLightboxTouchStart] = useState(0);
  const [lightboxTouchEnd, setLightboxTouchEnd] = useState(0);

  // Lightbox handlers
  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Navigate to next/previous image in lightbox
  const goToNextImage = () => {
    const images = cafe?.images || [];
    if (images.length <= 1) return;

    const currentIndex = images.findIndex(
      (img) => img.id === selectedImageId
    );
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImageId(images[nextIndex].id);
  };

  const goToPreviousImage = () => {
    const images = cafe?.images || [];
    if (images.length <= 1) return;

    const currentIndex = images.findIndex(
      (img) => img.id === selectedImageId
    );
    const previousIndex =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImageId(images[previousIndex].id);
  };

  // Touch handlers for swipe
  const handleTouchStartLightbox = (e: React.TouchEvent) => {
    setLightboxTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMoveLightbox = (e: React.TouchEvent) => {
    setLightboxTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEndLightbox = () => {
    if (!lightboxTouchStart || !lightboxTouchEnd) return;

    const distance = lightboxTouchStart - lightboxTouchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextImage();
    }
    if (isRightSwipe) {
      goToPreviousImage();
    }

    // Reset
    setLightboxTouchStart(0);
    setLightboxTouchEnd(0);
  };

  // Handle keyboard for lightbox (ESC, Arrow Left, Arrow Right)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      }
    };

    if (isLightboxOpen) {
      document.addEventListener("keydown", handleKeyboard);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, selectedImageId]);

  // Update selectedImageId when cafe data is loaded
  useEffect(() => {
    if (cafe?.mainImageId) {
      setSelectedImageId(cafe.mainImageId);
    } else if (cafe?.images?.[0]?.id) {
      setSelectedImageId(cafe.images[0].id);
    }
  }, [cafe]);

  // Reset drag state saat sheet ditutup
  useEffect(() => {
    if (!isOpen) {
      setDragCurrentY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Handler untuk swap image dengan animasi
  const handleImageClick = (imageId: string) => {
    setIsTransitioning(true);

    // Delay untuk animasi fade out
    setTimeout(() => {
      setSelectedImageId(imageId);
      setIsTransitioning(false);
    }, 150);
  };

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - dragStartY;
    // Hanya izinkan drag ke bawah
    if (deltaY > 0) {
      setDragCurrentY(deltaY);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    //  FIXED: Hanya close jika user benar-benar DRAG (bukan hanya tap)
    // Threshold: drag > 150px untuk close, drag < 10px = tap (tidak close)
    const dragDistance = dragCurrentY;

    if (dragDistance > 150) {
      // User drag cukup jauh → close modal
      onClose();
    }
    // else: drag distance terlalu kecil (tap) → tidak close

    // Reset drag state
    setDragCurrentY(0);
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Parking icons
  const parkingIcons: { [key: string]: string } = {
    Motor: "🏍️",
    Mobil: "🚗",
  };

  // Payment method icons
  const getPaymentIcon = (paymentLabel: string): string => {
    const label = paymentLabel.toLowerCase();

    if (label.includes('cash') || label.includes('tunai')) {
      return '💵'; // Cash icon
    }
    if (label.includes('qris') || label.includes('qr')) {
      return '📱'; // QR code / mobile payment icon
    }
    if (label.includes('debit') || label.includes('kredit') || label.includes('card') || label.includes('kartu')) {
      return '💳'; // Card icon
    }
    if (label.includes('gopay') || label.includes('ovo') || label.includes('dana') || label.includes('shopeepay')) {
      return '📱'; // E-wallet icon
    }

    return '💰'; // Default money icon
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          style={{
            zIndex: 9998,
            opacity: isDragging ? Math.max(0, 1 - dragCurrentY / 300) : 1,
          }}
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet (Mobile) / Modal (Desktop) */}
      <div
        className={`fixed bg-white shadow-2xl
          bottom-0 left-0 right-0 rounded-t-3xl
          md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:w-full md:max-w-6xl
          ${
            isDragging
              ? "transition-none"
              : "transition-all duration-500 ease-out"
          } ${
          isOpen
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-full opacity-0 pointer-events-none md:scale-95"
        }`}
        style={{
          maxHeight: "85vh", // FIXED: 85vh instead of 90vh untuk space swipe refresh
          overflowY: isDragging ? "hidden" : "auto",
          zIndex: 9999,
          transform: isOpen
            ? `translateY(${dragCurrentY}px)`
            : "translateY(100%)",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Bar - Draggable area (Mobile only) */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none md:hidden"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            className={`h-1 rounded-full transition-all ${
              isDragging
                ? "w-16 bg-[#803D3B]"
                : "w-12 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        </div>

        {/* Close Button (Desktop only) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail cafe"
          className="hidden md:flex absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors items-center justify-center group z-10"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        {cafe && (
          <div className="pb-8 md:pb-6">
            {/* Desktop: 2 column layout */}
            <div className="md:grid md:grid-cols-2 md:gap-6 md:p-6 md:pt-12">
              {/* Left Column: Images */}
              <div className="md:col-span-1">
                {cafe?.images && cafe.images.length > 0 && (
                  <div className="w-full px-6 md:px-0 mb-6 md:mb-0">
                    {(() => {
                      const displayedMainImage =
                        cafe.images.find((img) => img.id === selectedImageId) ||
                        cafe.images[0];

                      const otherImages = cafe.images.filter(
                        (img) => img.id !== selectedImageId
                      );

                      return (
                        <div className="space-y-2 md:sticky md:top-0">
                          {/* Main Image */}
                          <div
                            className="relative w-full h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden cursor-zoom-in group"
                            onClick={openLightbox}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openLightbox();
                              }
                            }}
                            aria-label="Klik untuk melihat gambar penuh"
                          >
                            <div
                              className={`absolute inset-0 transition-opacity duration-300 ${
                                isTransitioning ? "opacity-0" : "opacity-100"
                              }`}
                            >
                              <Image
                                src={displayedMainImage.imageUrl}
                                alt={displayedMainImage.alt || cafe.name}
                                fill
                                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                quality={95}
                                priority
                                unoptimized={false}
                              />
                            </div>
                            {/* Zoom indicator overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                                <svg
                                  className="w-8 h-8 text-[#803D3B]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Other Images - Grid */}
                          {otherImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {otherImages.map((img) => (
                                <button
                                  key={img.id}
                                  onClick={() => handleImageClick(img.id)}
                                  className="relative w-full h-24 bg-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-[#803D3B] hover:ring-opacity-50 active:scale-95"
                                >
                                  <Image
                                    src={img.imageUrl}
                                    alt={img.alt || cafe.name}
                                    fill
                                    className="object-cover transition-all duration-300"
                                    sizes="(max-width: 768px) 33vw, 16vw"
                                    quality={90}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="md:col-span-1 space-y-6">
                {/* Header */}
                <div className="space-y-2 px-6 md:px-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#803D3B]">
                    {cafe.name}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {cafe.address}
                  </p>
                </div>

                {/* Instagram Link */}
                {cafe.instagramUsername && cafe.instagramUrl && (
                  <div className="px-6 md:px-0 mb-6">
                    <a
                      href={cafe.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border border-purple-200 rounded-xl px-4 py-3 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group"
                    >
                      <svg
                        className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform"
                        fill="url(#instagram-gradient)"
                        viewBox="0 0 24 24"
                      >
                        <defs>
                          <linearGradient
                            id="instagram-gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              style={{ stopColor: "#833AB4" }}
                            />
                            <stop
                              offset="50%"
                              style={{ stopColor: "#E1306C" }}
                            />
                            <stop
                              offset="100%"
                              style={{ stopColor: "#FD1D1D" }}
                            />
                          </linearGradient>
                        </defs>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 mb-0.5">
                          Follow di Instagram
                        </div>
                        <div className="font-semibold text-gray-900">
                          {cafe.instagramUsername}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Opening Hours */}
                {cafe?.openingHours &&
                  cafe.openingHours.length > 0 &&
                  (() => {
                    // Helper function to format time from Date or string
                    const formatTime = (time: string | Date): string => {
                      if (typeof time === 'string') {
                        // If string, extract HH:MM from ISO format or return as is
                        if (time.includes('T')) {
                          return new Date(time).toTimeString().slice(0, 5);
                        }
                        return time.slice(0, 5);
                      }
                      // If Date object, convert to HH:MM
                      return time.toTimeString().slice(0, 5);
                    };

                    // Indonesian day name mapping
                    const dayNameMap: Record<string, string> = {
                      Monday: "Senin",
                      Tuesday: "Selasa",
                      Wednesday: "Rabu",
                      Thursday: "Kamis",
                      Friday: "Jumat",
                      Saturday: "Sabtu",
                      Sunday: "Minggu",
                    };

                    // Get current day in English
                    const currentDayEnglish = new Date().toLocaleDateString(
                      "en-US",
                      { weekday: "long" }
                    );

                    // Check if cafe is currently open
                    const getCurrentStatus = () => {
                      const now = new Date();
                      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
                      const todayHours = cafe.openingHours?.find(
                        (h) => h.dayOfWeek === currentDayEnglish
                      );

                      if (!todayHours || todayHours.isClosed)
                        return { isOpen: false, text: "Tutup Hari Ini" };
                      if (todayHours.isOpen24Hours)
                        return { isOpen: true, text: "Buka 24 Jam" };

                      const openTime = formatTime(todayHours.openTime);
                      const closeTime = formatTime(todayHours.closeTime);

                      // Handle midnight crossing (e.g., 07:00 - 00:00 or 18:00 - 02:00)
                      let isOpen: boolean;
                      if (closeTime < openTime) {
                        // Closes after midnight (e.g., 18:00 - 02:00)
                        isOpen =
                          currentTime >= openTime || currentTime < closeTime;
                      } else if (closeTime === "00:00") {
                        // Special case: closes at midnight (e.g., 07:00 - 00:00)
                        isOpen = currentTime >= openTime;
                      } else {
                        // Normal case: same day (e.g., 08:00 - 22:00)
                        isOpen =
                          currentTime >= openTime && currentTime < closeTime;
                      }

                      return {
                        isOpen,
                        text: isOpen ? "Buka Sekarang" : "Tutup Sekarang",
                      };
                    };

                    const currentStatus = getCurrentStatus();

                    return (
                      <div className="px-6 md:px-0 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[#333]">
                            Jam Operasional
                          </h3>
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              currentStatus.isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {currentStatus.text}
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                          {cafe.openingHours.map((hour) => {
                            const isToday =
                              hour.dayOfWeek === currentDayEnglish;
                            const dayIndonesian =
                              dayNameMap[hour.dayOfWeek] || hour.dayOfWeek;

                            // Determine if today is open or closed (based on real-time status)
                            const isTodayOpen = isToday && currentStatus.isOpen;
                            const isTodayClosed = isToday && !currentStatus.isOpen;

                            return (
                              <div
                                key={hour.dayOfWeek}
                                className={`flex justify-between items-center px-4 py-3 border-b border-gray-200 last:border-b-0 ${
                                  isTodayOpen
                                    ? "bg-green-50 border-l-4 border-l-green-500"
                                    : isTodayClosed
                                    ? "bg-red-50 border-l-4 border-l-red-500"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`font-semibold ${
                                    isTodayOpen
                                      ? "text-green-900"
                                      : isTodayClosed
                                      ? "text-red-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {dayIndonesian}
                                </span>
                                <span
                                  className={`font-medium ${
                                    hour.isClosed
                                      ? "text-red-600"
                                      : isTodayOpen
                                      ? "text-green-900"
                                      : "text-[#803D3B]"
                                  }`}
                                >
                                  {hour.isClosed
                                    ? "Tutup"
                                    : hour.isOpen24Hours
                                    ? "24 Jam"
                                    : `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                {/* Price Range Section */}
                {(cafe?.priceMin || cafe?.priceMax) && (
                  <div className="px-6 md:px-0 mb-6">
                    <h3 className="text-lg font-semibold text-[#333] mb-3">
                      Harga Menu
                    </h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      {(cafe?.priceMin && cafe?.priceMax) && (
                        <div className="text-gray-900 font-bold text-lg">
                          Rp {(cafe.priceMin || 0).toLocaleString("id-ID")} -{" "}
                          {(cafe.priceMax || 0).toLocaleString("id-ID")}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parking Section */}
                {parking.length > 0 && (
                  <div className="px-6 md:px-0 mb-6">
                    <h3 className="text-lg font-semibold text-[#333] mb-3">
                      Parkir
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parking.map((p) => (
                        <div
                          key={p}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          <span>{parkingIcons[p.trim()] || "🅿️"}</span>
                          <span>{p.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Methods Section */}
                {payments.length > 0 && (
                  <div className="px-6 md:px-0 mb-6">
                    <h3 className="text-lg font-semibold text-[#333] mb-3">
                      Pembayaran
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {payments.map((pm) => (
                        <div
                          key={pm.paymentMethod.code}
                          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          <span>{getPaymentIcon(pm.paymentMethod.label)}</span>
                          <span>{pm.paymentMethod.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities Section */}
                {facilities.length > 0 && (
                  <div className="px-6 md:px-0 mb-6">
                    <h3 className="text-lg font-semibold text-[#333] mb-3">
                      Fasilitas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {facilities.map((f) => (
                        <div
                          key={f.facility.code}
                          className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          <span>{f.facility.icon || "✓"}</span>
                          <span>{f.facility.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 px-6 pb-24 md:px-0 md:pb-0">
                  {cafe.googleMapsUrl && (
                    <a
                      href={cafe.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border-2 border-[#803D3B] text-[#803D3B] hover:bg-[#803D3B]/5 font-semibold py-3 rounded-lg text-center transition-colors duration-200"
                    >
                      📍 Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {isLightboxOpen && cafe && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in"
          style={{ zIndex: 10000 }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Gambar penuh"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Tutup gambar penuh"
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors flex items-center justify-center group z-10"
          >
            <svg
              className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Keyboard hints (desktop only) */}
          <div className="absolute top-4 left-4 text-white/70 text-sm bg-black/30 backdrop-blur-md px-3 py-2 rounded-lg hidden md:block">
            <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
            <span className="mx-1">/</span>
            <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
            <span className="mx-2">navigasi</span>
            <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd>
            <span className="ml-1">keluar</span>
          </div>

          {/* Image counter */}
          {cafe?.images && cafe.images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
              {cafe.images.findIndex((img) => img.id === selectedImageId) + 1} /{" "}
              {cafe.images.length}
            </div>
          )}

          {/* Previous button */}
          {cafe?.images && cafe.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousImage();
              }}
              aria-label="Gambar sebelumnya"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center group z-10 hover:scale-110 active:scale-95"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next button */}
          {cafe?.images && cafe.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              aria-label="Gambar berikutnya"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center group z-10 hover:scale-110 active:scale-95"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Image container with touch support */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStartLightbox}
            onTouchMove={handleTouchMoveLightbox}
            onTouchEnd={handleTouchEndLightbox}
          >
            {(() => {
              const displayedImage =
                cafe?.images?.find((img) => img.id === selectedImageId) ||
                cafe?.images?.[0];

              if (!displayedImage) return null;

              return (
                <div className="relative w-full h-full">
                  <Image
                    src={displayedImage.imageUrl}
                    alt={displayedImage.alt || cafe?.name || "Cafe"}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    quality={100}
                    priority
                  />
                </div>
              );
            })()}
          </div>

          {/* Cafe name caption */}
          {cafe?.name && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm md:text-base font-medium max-w-md text-center">
              {cafe.name}
            </div>
          )}
        </div>
      )}
    </>
  );
}
