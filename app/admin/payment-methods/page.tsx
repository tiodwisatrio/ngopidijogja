'use client';

import { useEffect, useState } from 'react';

interface PaymentMethod {
  id: string;
  code: string;
  label: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newLabel.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode, label: newLabel }),
      });

      if (!res.ok) throw new Error('Failed to add method');

      const newMethod = await res.json();
      setMethods([...methods, newMethod]);
      setNewCode('');
      setNewLabel('');
    } catch (err) {
      alert('Failed to add payment method');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Methods</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add New Method Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Payment Method</h2>
        <form onSubmit={handleAddMethod} className="flex gap-4">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Code (e.g., gopay)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., GoPay)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Methods List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : methods.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payment methods yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Code
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Label
                </th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr
                  key={method.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {method.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">{method.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
