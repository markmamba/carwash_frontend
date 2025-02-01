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

const ReportAPI = {
  async getFinancialReport(filter) {
    try {
      console.log(filter);
      const response = await apiClient.get(`/finance/report/`, {
        params: {
          "filter[label]": filter.period.label,
          "filter[value]": filter.period.value,
          year: filter.year,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching financial report:", error);
      throw error;
    }
  },

  async getCompletedBookings() {
    try {
      const response = await apiClient.get(`/completed-bookings/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
      throw error;
    }
  },
};

export default ReportAPI;
