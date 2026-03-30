"use client";

import Navbar from "@/components/Navbar";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  duration: number;
  status: string;
  patientNotes: string;
  doctor: {
    _id: string;
    name: string;
    speciality: string;
    location: string;
    phone: string;
    email: string;
  };
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!user) return;

    const fetchBookings = async () => {
      try {
        const data: any = await getMyBookings();
        setBookings(data.bookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, authLoading, router]);

  const handleCancel = async (slotId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;

    setCancellingId(slotId);
    try {
      await cancelBooking(slotId);
      // Remove from the list
      setBookings((prev) => prev.filter((b) => b._id !== slotId));
    } catch (err) {
      console.error("Failed to cancel:", err);
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Find a doctor and book your first appointment
            </p>
            <button
              onClick={() => router.push("/search")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Find Doctors
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.doctor.name}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {booking.doctor.speciality}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        📅 {formatDate(booking.date)} at{" "}
                        {formatTime(booking.startTime)}
                      </p>
                      <p>⏱️ {booking.duration} minutes</p>
                      <p>📍 {booking.doctor.location}</p>
                      <p>📞 {booking.doctor.phone}</p>
                      <p>✉️ {booking.doctor.email}</p>
                    </div>

                    {booking.patientNotes && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Your notes:</p>
                        <p className="text-sm text-gray-600">
                          {booking.patientNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:items-end">
                    <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full w-fit">
                      Confirmed
                    </span>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition disabled:opacity-50 mt-2"
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Appointment"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}