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

export const fetchServices = async () => {
  try {
    const response = await apiClient.get(API_URL + "/services/");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching services: " + error.message);
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await apiClient.post("/services/", serviceData);
    return response.data;
  } catch (error) {
    throw new Error("Error creating service: " + error.message);
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await apiClient.put(
      `/services/${serviceId}/`,
      serviceData
    );
    return response.data;
  } catch (error) {
    throw new Error("Error updating service: " + error.message);
  }
};

export const deleteService = async (serviceId) => {
  try {
    const response = await apiClient.delete(`/services/${serviceId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error deleting service: " + error.message);
  }
};
