import axios from "axios";

const API_URL = "http://localhost:8000/api";
const apiClient = axios.create({
  baseURL: API_URL,
});

export const login = async (username, password) => {
  try {
    const response = await apiClient.post("/login/", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
