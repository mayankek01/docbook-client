"use client";

import Navbar from "@/components/Navbar";
import { getDoctors, getSpecialities, ragSearch } from "@/lib/api";
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
  similarity?: number;
}

// Map specialities to colors for visual distinction
const specialityColors: Record<string, string> = {
  "Cardiologist": "bg-red-50 text-red-700 border-red-200",
  "General Physician": "bg-blue-50 text-blue-700 border-blue-200",
  "Dermatologist": "bg-pink-50 text-pink-700 border-pink-200",
  "Orthopedic": "bg-orange-50 text-orange-700 border-orange-200",
  "Pediatrician": "bg-green-50 text-green-700 border-green-200",
  "Neurologist": "bg-purple-50 text-purple-700 border-purple-200",
  "ENT Specialist": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Gynecologist": "bg-rose-50 text-rose-700 border-rose-200",
  "Psychiatrist": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Dentist": "bg-teal-50 text-teal-700 border-teal-200",
};

// Map specialities to icons
const specialityIcons: Record<string, string> = {
  "Cardiologist": "❤️",
  "General Physician": "🩺",
  "Dermatologist": "✨",
  "Orthopedic": "🦴",
  "Pediatrician": "👶",
  "Neurologist": "🧠",
  "ENT Specialist": "👂",
  "Gynecologist": "🌸",
  "Psychiatrist": "🧘",
  "Dentist": "🦷",
};

export default function SearchPage() {
  const router = useRouter();
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [location, setLocation] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [symptomQuery, setSymptomQuery] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [isRagResult, setIsRagResult] = useState(false);

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
    setIsRagResult(false);
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

  const handleRagSearch = async () => {
    if (!symptomQuery.trim()) return;

    setRagLoading(true);
    setSearched(true);
    setIsRagResult(true);
    try {
      const data: any = await ragSearch(symptomQuery);
      setDoctors(data.doctors);
      setTotal(data.count);
      setTotalPages(1);
      setPage(1);
    } catch (err) {
      console.error("RAG search failed:", err);
    } finally {
      setRagLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* AI Symptom Search — Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-10 mb-8 shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                AI-Powered
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Describe your symptoms
            </h1>
            <p className="text-blue-100 text-sm md:text-base mb-6 max-w-lg">
              Tell us what you&apos;re experiencing and our AI will match you with the most relevant specialists
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={symptomQuery}
                  onChange={(e) => setSymptomQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRagSearch();
                    }
                  }}
                  placeholder="e.g. I have been having chest pain and shortness of breath for 2 days..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl outline-none transition resize-none bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                onClick={handleRagSearch}
                disabled={ragLoading || !symptomQuery.trim()}
                className="bg-white text-blue-700 px-8 py-3 rounded-xl mb-[5px] hover:bg-blue-50 transition disabled:opacity-50 font-semibold whitespace-nowrap sm:self-end shadow-lg hover:shadow-xl"
              >
                {ragLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Find Doctor →"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Manual Search Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <p className="text-sm font-medium text-gray-700">Or search manually</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Speciality
              </label>
              <select
                value={selectedSpeciality}
                onChange={(e) => setSelectedSpeciality(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white text-gray-800"
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
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(1);
                }}
                placeholder="e.g. Delhi, Mumbai, Bangalore"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition text-gray-800"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleSearch(1)}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {(loading || ragLoading) && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-600 font-medium">
                {ragLoading ? "Analyzing your symptoms..." : "Searching for doctors..."}
              </span>
            </div>
          </div>
        )}

        {!loading && !ragLoading && searched && doctors.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg font-medium">No doctors found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or describe your symptoms differently
            </p>
          </div>
        )}

        {!loading && !ragLoading && doctors.length > 0 && (
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm">
                {isRagResult
                  ? `${total} doctor${total > 1 ? "s" : ""} matched your symptoms`
                  : `Showing ${doctors.length} of ${total} doctor${total > 1 ? "s" : ""}`}
              </p>
              {isRagResult && (
                <button
                  onClick={() => {
                    setIsRagResult(false);
                    setSearched(false);
                    setDoctors([]);
                    setSymptomQuery("");
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Clear results
                </button>
              )}
            </div>

            {/* Doctor cards */}
            <div className="space-y-4">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  onClick={() => router.push(`/doctor/${doctor._id}`)}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden"
                >
                  {/* Best match indicator */}
                  {isRagResult && index === 0 && doctor.similarity !== undefined && doctor.similarity >= 0.18 && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                      Best Match
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Doctor avatar placeholder */}
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl border border-blue-200/50">
                        {specialityIcons[doctor.speciality] || "🩺"}
                      </div>
                    </div>

                    {/* Doctor info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                              {doctor.name}
                            </h3>
                            {isRagResult && doctor.similarity !== undefined && (
                              <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                  doctor.similarity >= 0.20
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : doctor.similarity >= 0.15
                                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                                    : "bg-gray-50 text-gray-500 border border-gray-200"
                                }`}
                              >
                                {doctor.similarity >= 0.20
                                  ? "Best match for you"
                                  : doctor.similarity >= 0.15
                                  ? "Good match"
                                  : "Related"}
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg mt-1.5 border ${
                              specialityColors[doctor.speciality] || "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {doctor.speciality}
                          </span>
                        </div>

                        {/* Rating badge */}
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                          <span className="text-amber-500 text-sm">★</span>
                          <span className="text-amber-700 text-sm font-semibold">{doctor.rating}</span>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm mt-2.5 line-clamp-2 leading-relaxed">
                        {doctor.description}
                      </p>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <span>{doctor.experience} yrs experience</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <span>{doctor.totalPatients.toLocaleString()} patients</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span>{doctor.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center text-gray-300 group-hover:text-blue-400 transition">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination — only for manual search */}
            {!isRagResult && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition shadow-sm ${
                      p === page
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}