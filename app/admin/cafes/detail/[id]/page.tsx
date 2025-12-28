'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  code: string;
  label: string;
}

interface CafePaymentMethodRecord {
  cafeId: string;
  paymentMethodId: string;
}

interface CafeImage {
  id: string;
  imageUrl: string;
  alt?: string;
}

interface OpeningHour {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  isOpen24Hours: boolean;
  isEverydayOpen: boolean;
}

interface Cafe {
  id: string;
  slug: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  instagramUsername: string | null;
  wifi: boolean;
  parking: string | null;
  facilities: string | null;
  mainImageId?: string;
  createdAt: string;
  updatedAt: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CafeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [images, setImages] = useState<CafeImage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cafePaymentMethods, setCafePaymentMethods] = useState<string[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCafeDetails();
    }
  }, [id]);

  const fetchCafeDetails = async () => {
    try {
      // Fetch cafe data
      const cafeRes = await fetch(`/api/cafes/${id}`);
      if (!cafeRes.ok) throw new Error('Failed to fetch cafe');
      const cafeData = await cafeRes.json();
      setCafe(cafeData);

      // Fetch images
      const imagesRes = await fetch(`/api/cafe-images?cafeId=${id}`);
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setImages(Array.isArray(imagesData) ? imagesData : []);
      }

      // Fetch payment methods
      const paymentMethodsRes = await fetch('/api/payment-methods');
      if (paymentMethodsRes.ok) {
        const paymentData = await paymentMethodsRes.json();
        setPaymentMethods(Array.isArray(paymentData) ? paymentData : []);
      }

      // Fetch cafe payment methods
      const cafePaymentRes = await fetch(`/api/cafe-payment-methods?cafeId=${id}`);
      if (cafePaymentRes.ok) {
        const cafePaymentData = await cafePaymentRes.json();
        const paymentIds = (Array.isArray(cafePaymentData) ? cafePaymentData : []).map(
          (pm: CafePaymentMethodRecord) => pm.paymentMethodId
        );
        setCafePaymentMethods(paymentIds);
      }

      // Fetch opening hours
      const hoursRes = await fetch(`/api/opening-hours?cafeId=${id}`);
      if (hoursRes.ok) {
        const hoursData = await hoursRes.json();
        setOpeningHours(Array.isArray(hoursData) ? hoursData : []);
      }
    } catch (err) {
      setError('Failed to load cafe details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!cafe) {
    return <div className="text-center py-8 text-red-600">Cafe not found</div>;
  }

  const mainImage = images.find((img) => img.id === cafe.mainImageId);
  const selectedPaymentMethods = paymentMethods.filter((pm) =>
    cafePaymentMethods.includes(pm.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{cafe.name}</h1>
          <p className="text-gray-600 mt-1">Slug: {cafe.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/cafes/${cafe.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit
          </Link>
          <Link
            href="/admin/cafes"
            className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Main Image */}
      {mainImage && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Main Image</h2>
          <div className="flex justify-center">
            <img
              src={mainImage.imageUrl}
              alt={mainImage.alt || cafe.name}
              className="max-w-md max-h-96 object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Address</p>
              <p className="text-gray-900">{cafe.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">WiFi</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  cafe.wifi ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cafe.wifi ? '✓ Available' : '✗ Not Available'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Parking</p>
              {cafe.parking ? (
                <div className="flex flex-wrap gap-2">
                  {cafe.parking.split(", ").map((type, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Facilities</p>
              {cafe.facilities ? (
                <div className="flex flex-wrap gap-2">
                  {cafe.facilities.split(", ").map((facility, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="space-y-3">
            {cafe.latitude && cafe.longitude && (
              <div>
                <p className="text-sm font-medium text-gray-600">Coordinates</p>
                <p className="text-gray-900">
                  {cafe.latitude}, {cafe.longitude}
                </p>
              </div>
            )}
            {cafe.googleMapsUrl && (
              <div>
                <p className="text-sm font-medium text-gray-600">Google Maps</p>
                <a
                  href={cafe.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cafe.instagramUrl && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Instagram URL</p>
              <a
                href={cafe.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {cafe.instagramUrl}
              </a>
            </div>
          )}
          {cafe.instagramUsername && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Instagram Username</p>
              <p className="text-gray-900">{cafe.instagramUsername}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      {selectedPaymentMethods.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedPaymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <p className="text-sm font-medium text-blue-900">{pm.label}</p>
                <p className="text-xs text-blue-600">{pm.code}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {openingHours.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Opening Hours</h2>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const hour = openingHours.find((h) => h.dayOfWeek === day);
              return (
                <div
                  key={day}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <span className="font-medium text-gray-900">{day}</span>
                  <span className="text-gray-700">
                    {!hour || hour.isClosed ? (
                      <span className="text-red-600">Closed</span>
                    ) : hour.isOpen24Hours ? (
                      <span className="text-green-600">24 Hours</span>
                    ) : (
                      `${hour.openTime} - ${hour.closeTime}`
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Images Gallery */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Image Gallery ({images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`rounded-lg overflow-hidden border-2 ${
                  image.id === cafe.mainImageId ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={image.alt || cafe.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22%3EInvalid URL%3C/text%3E%3C/svg%3E';
                  }}
                />
                {image.id === cafe.mainImageId && (
                  <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 text-center">
                    Main Image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <p>Created: {new Date(cafe.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(cafe.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
