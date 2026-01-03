"use client";

import { useEffect, useState } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${
        isClosing ? "modal-backdrop-exit" : "modal-backdrop"
      }`}
      style={{ zIndex: 10000 }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          isClosing ? "modal-content-exit" : "modal-content"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-1000000">
          <h2 className="text-2xl font-bold text-[#803D3B]">
            Tentang wfcjogja
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-[#803D3B] transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Hero Section */}
          <div
            className="modal-section text-center space-y-2"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-semibold text-[#803D3B]">
              wfcjogja - Work From Cafe Jogja
            </h3>
            <p className="text-gray-600 text-sm">
              Temukan cafe terbaik untuk produktivitas Kamu
            </p>
          </div>

          {/* Description */}
          <div
            className="modal-section space-y-4 text-gray-700"
            style={{ animationDelay: "0.2s" }}
          >
            <p>
              <strong className="text-[#803D3B]">wfcjogja</strong> adalah
              platform pencarian cafe yang dirancang khusus untuk para remote
              worker, freelancer, dan mahasiswa di Yogyakarta yang mencari
              tempat nyaman untuk bekerja atau belajar.
            </p>

            <p>
              Kami menyediakan informasi lengkap tentang fasilitas cafe seperti
              WiFi, colokan, AC, area outdoor, dan banyak lagi. Dengan fitur
              filter yang powerful, Kamu bisa menemukan cafe yang sesuai dengan
              kebutuhan Kamu dengan mudah.
            </p>
          </div>

          {/* Features */}
          <div
            className="modal-section space-y-3"
            style={{ animationDelay: "0.3s" }}
          >
            <h4 className="font-semibold text-[#803D3B]">✨ Fitur Utama</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-[#FFF5F5] rounded-lg">
                <span className="text-2xl">🗺️</span>
                <div>
                  <p className="font-medium text-[#803D3B]">Peta Interaktif</p>
                  <p className="text-xs text-gray-600">
                    Lihat lokasi cafe di peta dengan mudah
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#FFF5F5] rounded-lg">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium text-[#803D3B]">Pencarian Cerdas</p>
                  <p className="text-xs text-gray-600">
                    Filter berdasarkan fasilitas yang Kamu butuhkan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#FFF5F5] rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-medium text-[#803D3B]">Cafe Terdekat</p>
                  <p className="text-xs text-gray-600">
                    Temukan cafe terdekat dari lokasi Kamu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#FFF5F5] rounded-lg">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-medium text-[#803D3B]">Info Lengkap</p>
                  <p className="text-xs text-gray-600">
                    Jam buka, parkir, metode pembayaran, dan lainnya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div
            className="modal-section space-y-3"
            style={{ animationDelay: "0.4s" }}
          >
            <h4 className="font-semibold text-[#803D3B]">🛠️ Teknologi</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js",
                "TypeScript",
                "Prisma",
                "PostgreeSQL",
                "Tailwind CSS",
                "Leaflet",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-[#FFD8D8] text-[#803D3B] rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className="modal-section bg-gradient-to-r from-[#803D3B] to-[#6B3230] text-white rounded-2xl p-6 text-center space-y-3"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="font-semibold">
              Punya saran cafe yang belum terdaftar?
            </p>
            <p className="text-sm opacity-90">
              Bantu kami melengkapi database dengan mengusulkan cafe favoritmu!
            </p>
            <button
              onClick={() => {
                window.open(
                  "https://docs.google.com/forms/d/e/1FAIpQLScH3pXuneYfsU1ZPb2ePtP6biISv1gn6vCFRiseO-N-VzNhnA/viewform?usp=sharing&ouid=107076346346742720423",
                  "_blank"
                );
              }}
              className="bg-white text-[#803D3B] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Usulkan Cafe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
