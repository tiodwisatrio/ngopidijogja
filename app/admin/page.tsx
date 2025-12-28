'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  cafes: number;
  paymentMethods: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ cafes: 0, paymentMethods: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cafesRes, methodsRes] = await Promise.all([
          fetch('/api/cafes'),
          fetch('/api/payment-methods'),
        ]);

        if (cafesRes.ok && methodsRes.ok) {
          const cafes = await cafesRes.json();
          const methods = await methodsRes.json();

          setStats({
            cafes: Array.isArray(cafes) ? cafes.length : 0,
            paymentMethods: Array.isArray(methods) ? methods.length : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Cafes',
      value: stats.cafes,
      icon: '☕',
      color: 'bg-blue-500',
      href: '/admin/cafes',
    },
    {
      title: 'Payment Methods',
      value: stats.paymentMethods,
      icon: '💳',
      color: 'bg-green-500',
      href: '/admin/payment-methods',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`${card.color} rounded-lg p-4 text-white text-3xl`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/cafes/new"
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold text-gray-900">Add New Cafe</p>
              <p className="text-sm text-gray-600">Create a new cafe listing</p>
            </div>
          </Link>

          <Link
            href="/admin/cafes"
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-gray-900">View All Cafes</p>
              <p className="text-sm text-gray-600">Manage existing cafes</p>
            </div>
          </Link>

          <Link
            href="/admin/payment-methods"
            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl">💳</span>
            <div>
              <p className="font-semibold text-gray-900">Payment Methods</p>
              <p className="text-sm text-gray-600">Manage payment options</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
