"use client";

import { useEffect, useState } from "react";

interface Cafe {
  id: string;
  name: string;
}

interface OpeningHour {
  id: string;
  cafeId: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  isOpen24Hours?: boolean;
  isEverydayOpen?: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function OpeningHoursPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (selectedCafeId) {
      fetchHours(selectedCafeId);
    }
  }, [selectedCafeId]);

  const fetchCafes = async () => {
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const cafeList = Array.isArray(data) ? data : [];
      setCafes(cafeList);
      if (cafeList.length > 0) {
        setSelectedCafeId(cafeList[0].id);
      }
    } catch (err) {
      console.error("Failed to load cafes:", err);
    }
  };

  // Extract time from ISO string without timezone conversion
  const formatTimeForInput = (dateTimeString: string): string => {
    if (!dateTimeString) return "09:00";
    // Parse the ISO string and extract UTC time (no conversion)
    const date = new Date(dateTimeString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchHours = async (cafeId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opening-hours?cafeId=${cafeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Convert DateTime to HH:MM format for display
      const formattedData = Array.isArray(data)
        ? data.map((h: OpeningHour) => ({
            ...h,
            openTime: formatTimeForInput(h.openTime),
            closeTime: formatTimeForInput(h.closeTime),
          }))
        : [];

      setHours(formattedData);
    } catch (err) {
      console.error("Failed to load hours:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHourChange = (dayOfWeek: string, field: string, value: any) => {
    const existing = hours.find((h) => h.dayOfWeek === dayOfWeek);

    if (existing) {
      setHours(
        hours.map((h) =>
          h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
        )
      );
    } else {
      setHours([
        ...hours,
        {
          id: `new-${dayOfWeek}`,
          cafeId: selectedCafeId,
          dayOfWeek,
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: false,
          isOpen24Hours: false,
          isEverydayOpen: false,
          [field]: value,
        },
      ]);
    }
  };

  // No conversion - send time as-is
  // Database stores time, frontend handles timezone display
  const prepareTimeForSave = (timeString: string): string => {
    if (!timeString) return "00:00";
    return timeString; // Send as-is (HH:MM format)
  };

  const handleSave = async () => {
    if (!selectedCafeId) return;

    setSaving(true);
    try {
      for (const hour of hours) {
        // Send time as-is (no timezone conversion)
        const openTime = prepareTimeForSave(hour.openTime);
        const closeTime = prepareTimeForSave(hour.closeTime);

        console.log("Saving hour:", {
          day: hour.dayOfWeek,
          openTime: openTime,
          closeTime: closeTime,
        });

        let response;
        if (typeof hour.id === "string" && hour.id.startsWith("new-")) {
          // Create new
          response = await fetch("/api/opening-hours", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cafeId: selectedCafeId,
              dayOfWeek: hour.dayOfWeek,
              openTime: openTime,
              closeTime: closeTime,
              isClosed: hour.isClosed,
              isOpen24Hours: hour.isOpen24Hours || false,
              isEverydayOpen: hour.isEverydayOpen || false,
            }),
          });
        } else {
          // Update existing
          response = await fetch("/api/opening-hours", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: hour.id,
              openTime: openTime,
              closeTime: closeTime,
              isClosed: hour.isClosed,
              isOpen24Hours: hour.isOpen24Hours || false,
              isEverydayOpen: hour.isEverydayOpen || false,
            }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(`API error: ${errorData.error || "Unknown error"}`);
        }
      }
      alert("Opening hours saved!");
      fetchHours(selectedCafeId);
    } catch (err) {
      console.error("Save error:", err);
      alert(
        `Failed to save opening hours: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Opening Hours</h1>

      {/* Cafe Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Cafe
        </label>
        <select
          value={selectedCafeId}
          onChange={(e) => setSelectedCafeId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a cafe</option>
          {cafes.map((cafe) => (
            <option key={cafe.id} value={cafe.id}>
              {cafe.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCafeId ? (
        <div className="text-center py-8 text-gray-500">
          Please select a cafe to manage opening hours
        </div>
      ) : loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {DAYS.map((day) => {
              const hour = hours.find((h) => h.dayOfWeek === day);

              return (
                <div
                  key={day}
                  className="pb-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center gap-6 pb-4">
                    <div className="w-24 font-medium text-gray-900">{day}</div>

                    {!hour || !hour.isClosed ? (
                      <>
                        {!hour?.isOpen24Hours ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={hour?.openTime || "09:00"}
                              onChange={(e) =>
                                handleHourChange(
                                  day,
                                  "openTime",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-600">to</span>
                            <input
                              type="time"
                              value={hour?.closeTime || "18:00"}
                              onChange={(e) =>
                                handleHourChange(
                                  day,
                                  "closeTime",
                                e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="text-blue-600 font-medium">
                            24 Hours
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-600 font-medium">Closed</div>
                    )}
                  </div>

                  {/* Checkboxes Row */}
                  <div className="flex items-center gap-6 ml-24">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hour?.isOpen24Hours || false}
                        onChange={(e) =>
                          handleHourChange(
                            day,
                            "isOpen24Hours",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">24 Hours</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hour?.isEverydayOpen || false}
                        onChange={(e) =>
                          handleHourChange(
                            day,
                            "isEverydayOpen",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Same as all days
                      </span>
                    </label>

                    <label className="flex items-center gap-2 ml-auto">
                      <input
                        type="checkbox"
                        checked={hour?.isClosed || false}
                        onChange={(e) =>
                          handleHourChange(day, "isClosed", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Closed</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Opening Hours"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
