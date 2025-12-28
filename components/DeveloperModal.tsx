"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperModal({
  isOpen,
  onClose,
}: DeveloperModalProps) {
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

  // Dummy developer data - you can customize this later
  const developer = {
    name: "Tio Dwi Satrio",
    tagline: "Full-Stack Developer | Tukang Ngopi",
    bio: "Saya tertarik membangun produk digital yang berguna. WFC Jogja adalah project personal yang lahir dari ketertarikan saya pada budaya ngopi dan kebutuhan mencari tempat kerja & belajar yang nyaman di Yogyakarta.",
    avatar: "/profil.jpeg",
    socials: [
      {
        name: "Portfolio",
        icon: "🌐",
        url: "https://tiodwisatrio.com",
        display: "tiodwisatrio.com",
      },
      {
        name: "GitHub",
        icon: "👨‍💻",
        url: "https://github.com/tiodwisatrio",
        display: "github.com/tiodwisatrio",
      },
      {
        name: "LinkedIn",
        icon: "💼",
        url: "https://www.linkedin.com/in/tio-dwi-satrio-a91153177/",
        display: "linkedin.com/in/tio-dwi-satrio-a91153177",
      },
      {
        name: "Email",
        icon: "📧",
        url: "mailto:tiodwisatrio27@email.com",
        display: "tiodwisatrio27@email.com",
      },
      {
        name: "Instagram",
        icon: "📱",
        url: "https://instagram.com/tiodwisatrio_",
        display: "@tiodwisatrio_",
      },
    ],
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${
        isClosing ? "modal-backdrop-exit" : "modal-backdrop"
      }`}
      style={{ zIndex: 10000 }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          isClosing ? "modal-content-exit" : "modal-content"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-1000000">
          <h2 className="text-2xl font-bold text-[#803D3B]">Developer</h2>
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
          {/* Profile Section */}
          <div
            className="modal-section text-center space-y-4"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="relative inline-block">
              <Image
                src={developer.avatar}
                alt={developer.name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full mx-auto border-4 border-[#FFD8D8] shadow-lg"
              />
              <div className="absolute bottom-0 right-0 bg-[#08c225] text-white rounded-full p-2">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#803D3B]">
                {developer.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{developer.tagline}</p>
            </div>
          </div>

          {/* Bio */}
          <div
            className="modal-section bg-[#FFF5F5] rounded-2xl p-5 space-y-2"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-2 text-[#803D3B] font-semibold">
              <span className="text-xl">👋</span>
              <span>Hi, I&#39;m {developer.name}!</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {developer.bio}
            </p>
          </div>

          {/* Tech & Tools */}
          <div
            className="modal-section space-y-3"
            style={{ animationDelay: "0.3s" }}
          >
            <h4 className="font-semibold text-[#803D3B] flex items-center gap-2">
              <span className="text-xl">⚡</span>
              Skills & Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript",
                "TypeScript",
                "PHP",
                "React",
                "Next.js",
                "Node.js",
                "PostgreSQL",
                "MySQL",
                "Prisma",
                "Laravel",
                "Codeigniter",
                "ExpresJS",
                "Bootstrap",
                "Tailwind CSS",
                "Figma",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#FFD8D8] text-[#803D3B] rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div
            className="modal-section space-y-3"
            style={{ animationDelay: "0.4s" }}
          >
            <h4 className="font-semibold text-[#803D3B] flex items-center gap-2">
              <span className="text-xl">🔗</span>
              Connect With Me
            </h4>
            <div className="space-y-2">
              {developer.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-[#FFD8D8] hover:bg-[#FFF5F5] transition-all duration-300 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {social.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#803D3B]">
                      {social.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {social.display}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#803D3B] group-hover:translate-x-1 transition-all duration-300"
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
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div
            className="modal-section bg-gradient-to-r from-[#803D3B] to-[#6B3230] text-white rounded-2xl p-5 text-center space-y-2"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="font-semibold">💬 Let&#39;s Work Together!</p>
            <p className="text-xs opacity-90">
              Punya project yang ingin dikembangkan? Jangan sungkan untuk
              menghubungi saya!
            </p>
          </div>

          {/* Made with Love */}
          <div className="text-center text-xs text-gray-500">
            <p>Built with ❤️ and ☕ in Yogyakarta</p>
          </div>
        </div>
      </div>
    </div>
  );
}
