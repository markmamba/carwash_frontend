import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

// Function to fetch all users
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchCustomers = async (search = "") => {
  try {
    const response = await apiClient.get("/customers/", {
      params: { search },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const fetchStaff = async () => {
  try {
    const response = await apiClient.get("/staff/");
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

// Function to add a new user
export const addUser = async (userData) => {
  try {
    const response = await apiClient.post("/users/", userData);
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Function to update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Function to delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
