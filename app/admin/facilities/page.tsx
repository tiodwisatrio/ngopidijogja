'use client';

import { useEffect, useState } from 'react';

interface Facility {
  id: string;
  code: string;
  label: string;
  icon: string | null;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [error, setError] = useState('');

  // Edit states
  const [editCode, setEditCode] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await fetch('/api/facilities');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load facilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newLabel.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          label: newLabel,
          icon: newIcon || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to add facility');

      const newFacility = await res.json();
      setFacilities([...facilities, newFacility]);
      setNewCode('');
      setNewLabel('');
      setNewIcon('');
    } catch (err) {
      alert('Failed to add facility');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (facility: Facility) => {
    setEditingId(facility.id);
    setEditCode(facility.code);
    setEditLabel(facility.label);
    setEditIcon(facility.icon || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditLabel('');
    setEditIcon('');
  };

  const handleUpdateFacility = async (id: string) => {
    try {
      const res = await fetch(`/api/facilities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCode,
          label: editLabel,
          icon: editIcon || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update facility');

      const updated = await res.json();
      setFacilities(facilities.map(f => f.id === id ? updated : f));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update facility');
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility? This will remove it from all cafes.')) {
      return;
    }

    try {
      const res = await fetch(`/api/facilities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete facility');

      setFacilities(facilities.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete facility');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Facilities</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add New Facility Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Facility</h2>
        <form onSubmit={handleAddFacility} className="flex gap-4">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Code (e.g., wifi)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., Wi-Fi)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="Icon (e.g., 🛜)"
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newCode.trim() || !newLabel.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Facilities List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities.map((facility) => (
              <tr key={facility.id} className="hover:bg-gray-50">
                {editingId === facility.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="Icon"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateFacility(facility.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-2xl">
                      {facility.icon || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {facility.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {facility.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(facility)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(facility.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {facilities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No facilities found. Add your first facility above.
          </div>
        )}
      </div>
    </div>
  );
}
