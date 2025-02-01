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

const ExpenseAPI = {
  getAllExpenses() {
    return apiClient.get("/expenses/");
  },

  getExpense(id) {
    return apiClient.get(`/expenses/${id}/`);
  },

  createExpense(expenseData) {
    return apiClient.post("/expenses/", expenseData);
  },

  updateExpense(id, expenseData) {
    return apiClient.put(`/expenses/${id}/`, expenseData);
  },

  deleteExpense(id) {
    return apiClient.delete(`/expenses/${id}/`);
  },
};

export default ExpenseAPI;
