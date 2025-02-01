import axios from "axios";

const API_URL = "http://localhost:8000/api";
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const BookingAPI = {
  getAllBookings() {
    return apiClient.get("/bookings/");
  },

  createBooking(data) {
    return apiClient.post("/bookings/", data);
  },

  updateBooking(id, data) {
    return apiClient.put(`/bookings/${id}/`, data);
  },

  updateBookingStatus(id, data) {
    return apiClient.patch(`/bookings/${id}/`, data);
  },

  deleteBooking(id) {
    return apiClient.delete(`/bookings/${id}/`);
  },
};

export default BookingAPI;
