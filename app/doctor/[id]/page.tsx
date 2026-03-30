"use client";

import Navbar from "@/components/Navbar";
import { getDoctorById, getSlots, bookSlot } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  description: string;
  experience: number;
  totalPatients: number;
  rating: number;
  location: string;
}

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  duration: number;
  status: string;
}

const getNextDates = (days: number) => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

// Helper: calculate end time from start time + duration
const getEndTime = (startTime: string, duration: number) => {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + duration;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientNotes, setPatientNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");

  const dates = getNextDates(6);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data: any = await getDoctorById(id as string);
        setDoctor(data);
        setSelectedDate(dates[0]);
      } catch (err) {
        console.error("Failed to load doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (!selectedDate || !id) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const data: any = await getSlots(id as string, selectedDate);
        setSlots(data.slots);
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, id]);

  const handleBook = async () => {
    if (!user) {
      // Redirect to login with return URL so user comes back here after login
      router.push(`/auth/login?redirect=/doctor/${id}`);
      return;
    }

    if (!selectedSlot) return;

    setBooking(true);
    setError("");
    try {
      await bookSlot(selectedSlot._id, patientNotes);
      setBookingSuccess(true);
      setSelectedSlot(null);
      setPatientNotes("");

      const data: any = await getSlots(id as string, selectedDate);
      setSlots(data.slots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">
          Loading doctor profile...
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Doctor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-block"
        >
          ← Back to search
        </button>

        {/* Doctor Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {doctor.name}
              </h1>
              <p className="text-blue-600 font-medium mt-1">
                {doctor.speciality}
              </p>
              <p className="text-gray-500 mt-3">{doctor.description}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {doctor.experience} yrs experience
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  {doctor.totalPatients.toLocaleString()} patients
                </span>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                  ★ {doctor.rating} rating
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500 md:text-right space-y-1">
              <p>📍 {doctor.location}</p>
              <p>📞 {doctor.phone}</p>
              <p>✉️ {doctor.email}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">Appointment booked successfully!</p>
            <p className="text-sm mt-1">
              You can view your booking in{" "}
              <button
                onClick={() => router.push("/bookings")}
                className="underline font-medium"
              >
                My Bookings
              </button>
            </p>
          </div>
        )}

        {/* Date Tabs + Slots */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Available Slots
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          {slotsLoading && (
            <div className="text-center py-8 text-gray-500">
              Loading slots...
            </div>
          )}

          {!slotsLoading && slots.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No slots available for this date
            </div>
          )}

          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((slot) => {
                const isBooked = slot.status === "booked";
                const isSelected = selectedSlot?._id === slot._id;

                return (
                  <button
                    key={slot._id}
                    onClick={() => !isBooked && setSelectedSlot(slot)}
                    disabled={isBooked}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      isBooked
                        ? "bg-red-50 text-red-300 cursor-not-allowed line-through"
                        : isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                    }`}
                  >
                    {formatTime(slot.startTime)} -{" "}
                    {formatTime(getEndTime(slot.startTime, slot.duration))}
                    <span className="block text-xs font-normal mt-0.5">
                      {isBooked ? "Booked" : `${slot.duration} min`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Booking Section */}
          {selectedSlot && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-800 mb-1">
                Confirm Booking
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(selectedSlot.date)} at{" "}
                {formatTime(selectedSlot.startTime)} ({selectedSlot.duration}{" "}
                min) with {doctor.name}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anything the doctor should know?{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. I've been having headaches for 3 days, mild chest pain..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {booking ? "Booking..." : "Confirm Booking"}
                </button>
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setPatientNotes("");
                    setError("");
                  }}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
