import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, expiresAt: string) => void;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  refreshAuthToken: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");
    if (token && expiresAt && new Date(expiresAt) > new Date()) {
      setIsAuthenticated(true);
    } else {
      logout();
    }
  }, []);

  const login = (token: string, expiresAt: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("expiresAt", expiresAt);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const refreshAuthToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const { token, expiresAt } = await response.json();
        login(token, expiresAt);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, refreshAuthToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
