"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface PaymentMethod {
  id: string;
  code: string;
  label: string;
}

interface CafePaymentMethodRecord {
  cafeId: string;
  paymentMethodId: string;
}

interface Facility {
  id: string;
  code: string;
  label: string;
  icon: string | null;
}

interface CafeFacilityRecord {
  cafeId: string;
  facilityId: string;
}

interface CafeImageRecord {
  id: string | number;
  imageUrl: string;
  alt?: string;
  cafeId?: string | number;
}

interface CafeImage {
  id: string;
  imageUrl: string;
  alt?: string;
  file?: File;
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
  parking: string | null;
  priceMin: number | null;
  priceMax: number | null;
  priceRange: string | null;
  mainImageId?: string;
}

export default function EditCafePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Cafe | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [images, setImages] = useState<CafeImage[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [mainImageId, setMainImageId] = useState<string>("");
  const [selectedParkingTypes, setSelectedParkingTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const PARKING_TYPES = ["Motor", "Mobil"];

  useEffect(() => {
    if (id) {
      fetchCafe();
      fetchPaymentMethods();
      fetchFacilities();
    }
  }, [id]);

  const fetchCafe = async () => {
    try {
      const res = await fetch(`/api/cafes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFormData(data);
      setMainImageId(data.mainImageId ? String(data.mainImageId) : "");

      // Parse existing parking types
      if (data.parking) {
        const parkingTypes = data.parking.split(", ").map((type: string) => type.trim());
        setSelectedParkingTypes(parkingTypes);
      }

      // Load existing payment methods for this cafe
      const cafePaymentRes = await fetch(
        `/api/cafe-payment-methods?cafeId=${id}`
      );
      if (cafePaymentRes.ok) {
        const cafePayments = await cafePaymentRes.json();
        const paymentIds = (
          Array.isArray(cafePayments) ? cafePayments : []
        ).map((pm: CafePaymentMethodRecord) => pm.paymentMethodId);
        setSelectedPaymentMethods(paymentIds);
      }

      // Load existing facilities for this cafe
      const cafeFacilitiesRes = await fetch(
        `/api/cafe-facilities?cafeId=${id}`
      );
      if (cafeFacilitiesRes.ok) {
        const cafeFacilities = await cafeFacilitiesRes.json();
        const facilityIds = (
          Array.isArray(cafeFacilities) ? cafeFacilities : []
        ).map((cf: CafeFacilityRecord) => cf.facilityId);
        setSelectedFacilities(facilityIds);
      }

      // Load existing images for this cafe
      const imagesRes = await fetch(`/api/cafe-images?cafeId=${id}`);
      if (imagesRes.ok) {
        const cafeImages = await imagesRes.json();
        // Convert image IDs to strings for consistency
        const formattedImages = (
          Array.isArray(cafeImages) ? cafeImages : []
        ).map((img: CafeImageRecord) => ({
          ...img,
          id: String(img.id),
        }));
        setImages(formattedImages);
      }
    } catch (err) {
      setError("Failed to load cafe");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/payment-methods");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await fetch("/api/facilities");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load facilities:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!formData) return;

    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: type === "checkbox" ? checked : value,
          }
        : null
    );
  };

  const handlePaymentMethodChange = (paymentMethodId: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(paymentMethodId)
        ? prev.filter((id) => id !== paymentMethodId)
        : [...prev, paymentMethodId]
    );
  };

  const handleParkingTypeChange = (parkingType: string) => {
    setSelectedParkingTypes((prev) =>
      prev.includes(parkingType)
        ? prev.filter((type) => type !== parkingType)
        : [...prev, parkingType]
    );
  };

  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((f) => f !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleAddImage = () => {
    if (!imageFile) {
      setError("Please select an image file");
      return;
    }

    const newImage: CafeImage = {
      id: `temp-${Date.now()}`,
      imageUrl: URL.createObjectURL(imageFile),
      alt: imageAlt,
    };

    setImages((prev) => [
      ...prev,
      {
        ...newImage,
        file: imageFile,
      },
    ]);
    setImageFile(null);
    setImageAlt("");

    if (mainImageId === "") {
      setMainImageId(newImage.id);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (mainImageId === id) {
      setMainImageId(images.length > 1 ? images[0].id : "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError("");
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        parking: selectedParkingTypes.length > 0 ? selectedParkingTypes.join(", ") : "",
      };

      const res = await fetch(`/api/cafes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) throw new Error("Failed to update cafe");

      // Update payment methods
      // First delete all existing payment methods
      const existingPayments = await fetch(
        `/api/cafe-payment-methods?cafeId=${id}`
      );
      if (existingPayments.ok) {
        const payments = await existingPayments.json();
        const existingIds = (Array.isArray(payments) ? payments : []).map(
          (pm: CafePaymentMethodRecord) => pm.paymentMethodId
        );

        // Delete removed payment methods
        for (const paymentMethodId of existingIds) {
          if (!selectedPaymentMethods.includes(paymentMethodId)) {
            await fetch(
              `/api/cafe-payment-methods?cafeId=${id}&paymentMethodId=${paymentMethodId}`,
              {
                method: "DELETE",
              }
            );
          }
        }

        // Add new payment methods
        for (const paymentMethodId of selectedPaymentMethods) {
          if (!existingIds.includes(paymentMethodId)) {
            await fetch("/api/cafe-payment-methods", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cafeId: id,
                paymentMethodId,
              }),
            });
          }
        }
      }

      // Update facilities using bulk update endpoint
      await fetch("/api/cafe-facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId: id,
          facilityIds: selectedFacilities,
        }),
      });

      // Handle image uploads and deletions
      // First, get the current list of images from the database
      const currentImagesRes = await fetch(`/api/cafe-images?cafeId=${id}`);
      const currentImages = currentImagesRes.ok
        ? await currentImagesRes.json()
        : [];
      const currentImageIds = currentImages.map((img: CafeImageRecord) =>
        img.id.toString()
      );

      // Delete images that were removed
      for (const currentImageId of currentImageIds) {
        if (!images.some((img) => img.id.toString() === currentImageId)) {
          await fetch(`/api/cafe-images?imageId=${currentImageId}`, {
            method: "DELETE",
          });
        }
      }

      // Upload new images
      const allImageIds: string[] = [];
      for (const image of images) {
        // If it's an existing image, just keep track of it
        if (!image.id.startsWith("temp-")) {
          allImageIds.push(image.id.toString());
          continue;
        }

        // Upload new images
        const fileToUpload = image.file;
        if (fileToUpload) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", fileToUpload);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            const { imageUrl } = await uploadRes.json();

            // Create cafe image record
            const imageRes = await fetch("/api/cafe-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cafeId: id,
                imageUrl,
                alt: image.alt,
              }),
            });

            if (imageRes.ok) {
              const createdImage = await imageRes.json();
              allImageIds.push(createdImage.id.toString());
            }
          }
        }
      }

      // Set main image if selected and exists in allImageIds
      if (mainImageId && allImageIds.includes(mainImageId.toString())) {
        await fetch("/api/cafe-images/set-main", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cafeId: id,
            imageId: mainImageId,
          }),
        });
      }

      router.push("/admin/cafes");
      router.refresh();
    } catch (err) {
      setError("Failed to update cafe. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!formData)
    return <div className="text-center py-8 text-red-600">Cafe not found</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Cafe</h1>
        <p className="text-gray-600 mt-2">{formData.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL-friendly name) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cafe Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                step="0.000001"
                value={formData.latitude || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                step="0.000001"
                value={formData.longitude || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              value={formData.googleMapsUrl || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                name="instagramUsername"
                value={formData.instagramUsername || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@cafe_username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Parking Types
            </label>
            <div className="space-y-2">
              {PARKING_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`parking-${type}`}
                    checked={selectedParkingTypes.includes(type)}
                    onChange={() => handleParkingTypeChange(type)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`parking-${type}`}
                    className="text-sm text-gray-700"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range (Harga Menu)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Min Price (Rp)
                </label>
                <input
                  type="number"
                  name="priceMin"
                  value={formData?.priceMin ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15000"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Max Price (Rp)
                </label>
                <input
                  type="number"
                  name="priceMax"
                  value={formData?.priceMax ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="45000"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Tier
                </label>
                <select
                  name="priceRange"
                  value={formData?.priceRange ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Auto</option>
                  <option value="$">$ (Murah)</option>
                  <option value="$$">$$ (Sedang)</option>
                  <option value="$$$">$$$ (Mahal)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tier akan auto-calculate jika dikosongkan: {"<"}20k = $, 20-40k = $$, {">"}40k = $$$
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Facilities
            </label>
            <div className="space-y-2">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`facility-${facility.id}`}
                    checked={selectedFacilities.includes(facility.id)}
                    onChange={() => handleFacilityChange(facility.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`facility-${facility.id}`}
                    className="text-sm text-gray-700 flex items-center gap-2"
                  >
                    {facility.icon && <span>{facility.icon}</span>}
                    <span>{facility.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Methods
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`payment-${method.id}`}
                    checked={selectedPaymentMethods.includes(method.id)}
                    onChange={() => handlePaymentMethodChange(method.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`payment-${method.id}`}
                    className="text-sm text-gray-700"
                  >
                    {method.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>

            {/* Image File Input */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description (Alt Text)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cafe interior, coffee cups, etc."
                />
              </div>

              <button
                type="button"
                onClick={handleAddImage}
                className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Image
              </button>
            </div>

            {/* Images List */}
            {images.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Images ({images.length})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        className="w-full object-cover rounded mb-2"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22%3EInvalid URL%3C/text%3E%3C/svg%3E";
                        }}
                      />

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="mainImage"
                            checked={mainImageId === image.id}
                            onChange={() => setMainImageId(image.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            Main Image
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          className="w-full text-sm bg-red-100 text-red-700 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/cafes"
              className="flex-1 bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
