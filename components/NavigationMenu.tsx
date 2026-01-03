"use client";

import { useState } from "react";

interface NavigationMenuProps {
  onAboutClick: () => void;
  onDeveloperClick: () => void;
}

export default function NavigationMenu({
  onAboutClick,
  onDeveloperClick,
}: NavigationMenuProps) {
  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLScH3pXuneYfsU1ZPb2ePtP6biISv1gn6vCFRiseO-N-VzNhnA/viewform?usp=sharing&ouid=107076346346742720423"; // TODO: Replace with actual form URL

  const handleSubmitClick = () => {
    window.open(GOOGLE_FORM_URL, "_blank");
  };

  return (
    <>
      {/* Desktop Navigation - Right Center */}
      <div
        className="nav-menu-container hidden md:flex fixed top-1/2 -translate-y-1/2 flex-col py-2 gap-3 bg-white rounded-full p-3 shadow-xl border border-gray-100"
        style={{ zIndex: 9999, right: "24px" }}
      >
        <button
          onClick={onAboutClick}
          className="nav-menu-button group relative bg-white hover:bg-[#FFF5F5] text-[#803D3B] rounded-2xl p-3 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
          style={{ animationDelay: "0.1s" }}
          title="Tentang Project"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-[#803D3B] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Tentang Project
            </div>
          </div>
        </button>

        <button
          onClick={handleSubmitClick}
          className="nav-menu-button group relative bg-white hover:bg-[#FFF5F5] text-[#803D3B] rounded-2xl p-3 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
          style={{ animationDelay: "0.2s" }}
          title="Usulkan Cafe"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-[#803D3B] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Usulkan Cafe
            </div>
          </div>
        </button>

        <button
          onClick={onDeveloperClick}
          className="nav-menu-button group relative bg-white hover:bg-[#FFF5F5] text-[#803D3B] rounded-2xl p-3 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
          style={{ animationDelay: "0.3s" }}
          title="Kontak Developer"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-[#803D3B] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Kontak Developer
            </div>
          </div>
        </button>
      </div>

      {/* Mobile Navigation - Bottom */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-4"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white rounded-full shadow-2xl border border-gray-100 flex justify-around items-center py-4 px-2">
          <button
            onClick={onAboutClick}
            className="flex flex-col items-center gap-1 text-[#803D3B] hover:text-[#6B3230] transition-all duration-300 active:scale-95"
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
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">Tentang</span>
          </button>

          <button
            onClick={handleSubmitClick}
            className="flex flex-col items-center gap-1 text-[#803D3B] hover:text-[#6B3230] transition-all duration-300 active:scale-95"
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
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs font-medium">Submit</span>
          </button>

          <button
            onClick={onDeveloperClick}
            className="flex flex-col items-center gap-1 text-[#803D3B] hover:text-[#6B3230] transition-all duration-300 active:scale-95"
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
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-medium">Developer</span>
          </button>
        </div>
      </div>
    </>
  );
}
