import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, getCurrentUser } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("campus_ai_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem("campus_ai_token");
      const storedUser = localStorage.getItem("campus_ai_user");
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await getCurrentUser();
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem("campus_ai_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    const accessToken = res.access_token;
    const userData = res.user;

    localStorage.setItem("campus_ai_token", accessToken);
    localStorage.setItem("campus_ai_user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("campus_ai_token");
    localStorage.removeItem("campus_ai_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
