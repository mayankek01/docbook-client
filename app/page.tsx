"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

const services = [
  {
    title: "Find Doctors Near You",
    description: "Search doctors by speciality and location, book appointments instantly",
    icon: "🔍",
    active: true,
    href: "/search",
  },
  {
    title: "Video Consultation",
    description: "Consult with top doctors from the comfort of your home",
    icon: "📹",
    active: false,
    href: "#",
  },
  {
    title: "Lab Tests",
    description: "Book lab tests and get reports delivered to your doorstep",
    icon: "🧪",
    active: false,
    href: "#",
  },
  {
    title: "Surgeries",
    description: "Safe and trusted surgeries with top hospitals",
    icon: "🏥",
    active: false,
    href: "#",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Your Health, Our Priority
          </h1>
          <p className="text-blue-100 text-lg">
            Find the best doctors, book appointments, and manage your health — all in one place.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              onClick={() => service.active && router.push(service.href)}
              className={`relative bg-white rounded-xl p-6 border transition ${
                service.active
                  ? "border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer"
                  : "border-gray-200 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Coming Soon Badge */}
              {!service.active && (
                <span className="absolute top-3 right-3 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}

              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm">{service.description}</p>

              {service.active && (
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Explore →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}