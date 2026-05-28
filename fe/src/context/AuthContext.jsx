import { createContext, useState, useEffect } from "react";
import { API_URL } from "../services/axios";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken") || null
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
    const savedRefreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
    if (savedRefreshToken) {
      setRefreshToken(savedRefreshToken);
    }
  }, []);

  const login = async (username, password, remember) => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, { username, password });
      const { token, refreshToken } = res.data;

      setToken(token);
      setRefreshToken(refreshToken);

      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("remember", true);
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("remember", false);
      }
    } catch (error) {
      console.error("Login gagal:", error);
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
    localStorage.removeItem("remember");
    sessionStorage.removeItem("remember");
  };

  return (
    <AuthContext.Provider value={{ refreshToken, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
