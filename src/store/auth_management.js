import axios from "axios";
import { createStore } from "vuex";

const API_URL = "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const store = createStore({
  state: {
    user: null,
    authToken: null,
  },
  getters: {
    isLoggedIn(state) {
      return !!state.authToken;
    },
    getUser(state) {
      return state.user;
    },
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_AUTH_TOKEN(state, token) {
      state.authToken = token;
    },
    LOGOUT(state) {
      state.user = null;
      state.authToken = null;
    },
  },
  actions: {
    async login({ commit }, { username, password }) {
      try {
        const response = await apiClient.post("/login/", {
          username,
          password,
        });

        const { access, user } = response.data;

        localStorage.setItem("authToken", access);
        localStorage.setItem("user", JSON.stringify(user));

        commit("SET_USER", user);
        commit("SET_AUTH_TOKEN", access);

        return { access, user };
      } catch (error) {
        return Promise.reject(error.response?.data || "Login failed");
      }
    },
    logout({ commit }) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      commit("LOGOUT");
    },
    checkAuth({ commit }) {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));

      if (token && user) {
        commit("SET_AUTH_TOKEN", token);
        commit("SET_USER", user);
      } else {
        commit("LOGOUT");
      }
    },
  },
});

export default store;
