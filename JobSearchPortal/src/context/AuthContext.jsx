import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const t = localStorage.getItem("token");
    const uStr = localStorage.getItem("user");
    if (t && uStr) {
      setToken(t);
      try { setUser(JSON.parse(uStr)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const flatUser = data.user?.user ? data.user.user : data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(flatUser));
    localStorage.setItem("role", flatUser.role);
    setToken(data.token);
    setUser(flatUser);
    return flatUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
      setUser(data);
      return data;
    } catch {
      logout();
      return null;
    }
  };

  return (
    <AuthCtx.Provider value={{ user, token, loading, isAuthed: !!token, login, logout, refreshMe }}>
      {children}
    </AuthCtx.Provider>
  );
}
