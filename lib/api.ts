import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// Auth APIs
export const signupApi = (body: { name: string; email: string; password: string; phone?: string }) =>
  api.post("/auth/signup", body);

export const loginApi = (body: { email: string; password: string }) =>
  api.post("/auth/login", body);

// Doctor APIs
export const getDoctors = (params: Record<string, string>) =>
  api.get("/doctors", { params });

export const getSpecialities = () =>
  api.get("/doctors/specialities");

export const getDoctorById = (id: string) =>
  api.get(`/doctors/${id}`);

// Slot APIs
export const getSlots = (doctorId: string, date: string) =>
  api.get(`/slots/${doctorId}`, { params: { date } });

export const bookSlot = (slotId: string, patientNotes: string) =>
  api.post(`/slots/${slotId}/book`, { patientNotes });

export const getMyBookings = () =>
  api.get("/slots/user/my-bookings");

export const cancelBooking = (slotId: string) =>
  api.post(`/slots/${slotId}/cancel`);

export const ragSearch = (query: string) =>
  api.post("/rag/search", { query });

export default api;