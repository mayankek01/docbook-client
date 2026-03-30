"use client";

import Navbar from "@/components/Navbar";
import { getDoctors, getSpecialities } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  experience: number;
  totalPatients: number;
  rating: number;
  location: string;
  description: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [location, setLocation] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data: any = await getSpecialities();
        setSpecialities(data.specialities);
      } catch (err) {
        console.error("Failed to load specialities:", err);
      }
    };
    fetchSpecialities();
  }, []);

  const handleSearch = async (searchPage: number = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = {
        page: String(searchPage),
        limit: "10",
      };
      if (selectedSpeciality) params.speciality = selectedSpeciality;
      if (location) params.location = location;

      const data: any = await getDoctors(params);
      setDoctors(data.doctors);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    let stars = "★".repeat(fullStars);
    if (hasHalf) stars += "½";
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Find Doctors Near You
        </h1>

        {/* Search Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speciality
              </label>
              <select
                value={selectedSpeciality}
                onChange={(e) => setSelectedSpeciality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition bg-white text-gray-800"
              >
                <option value="">All Specialities</option>
                {specialities.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Delhi, Mumbai, Bangalore"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition text-gray-800"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleSearch(1)}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            Searching for doctors...
          </div>
        )}

        {!loading && searched && doctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try changing your search filters
            </p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Showing {doctors.length} of {total} doctor{total > 1 ? "s" : ""}
            </p>

            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => router.push(`/doctor/${doctor._id}`)}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium mt-1">
                      {doctor.speciality}
                    </p>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {doctor.description}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-4 md:gap-2 md:items-end text-sm">
                    <div className="text-amber-500 font-medium">
                      {renderStars(doctor.rating)} {doctor.rating}
                    </div>
                    <div className="text-gray-500">
                      {doctor.experience} yrs exp
                    </div>
                    <div className="text-gray-500">
                      {doctor.totalPatients.toLocaleString()} patients
                    </div>
                    <div className="text-gray-400">
                      📍 {doctor.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      p === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}