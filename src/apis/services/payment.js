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

const PaymentAPI = {
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post("/payments/", paymentData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  getPayments: async (userId) => {
    try {
      const response = await apiClient.get("/payments/", {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  getPaymentById: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await apiClient.put(
        `/payments/${paymentId}/`,
        paymentData
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  deletePayment: async (paymentId) => {
    try {
      const response = await apiClient.delete(`/payments/${paymentId}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
};

export default PaymentAPI;
