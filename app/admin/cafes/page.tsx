"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";

interface Cafe {
  id: string;
  slug: string;
  name: string;
  address: string;
  wifi: boolean;
  parking: string;
}

const ITEMS_PER_PAGE = 10;

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCafes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load cafes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cafe?")) return;

    try {
      const res = await fetch(`/api/cafes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCafes(cafes.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete cafe");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(cafes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCafes = cafes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cafes</h1>
        <Link
          href="/admin/cafes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ➕ Add Cafe
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : cafes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No cafes yet. Create your first cafe!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-6 py-3 font-semibold">No</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Name
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Address
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Parking
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCafes.map((cafe) => (
                <tr
                  key={cafe.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="text-center px-6 py-4">
                    {startIndex + currentCafes.indexOf(cafe) + 1}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{cafe.name}</p>
                    <p className="text-sm text-gray-600">{cafe.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cafe.address}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cafe.parking || "N/A"}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Link
                      href={`/admin/cafes/detail/${cafe.id}`}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/cafes/${cafe.id}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(cafe.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
