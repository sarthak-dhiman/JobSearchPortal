import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const isAuthed = !!token && !!user;

  useEffect(() => {
    try {
      const t = localStorage.getItem("token") || sessionStorage.getItem("token");
      const uStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const u = uStr ? JSON.parse(uStr) : null;
      if (t && u) {
        setToken(t);
        setUser(u);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const { data } = await api.get("users/me");
        if (!ignore) setUser(data);
      } catch {
        if (!ignore) logout();
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const login = (nextUser, nextToken, remember = true) => {
    setUser(nextUser);
    setToken(nextToken);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", nextToken);
    storage.setItem("user", JSON.stringify(nextUser));
    (remember ? sessionStorage : localStorage).removeItem("token");
    (remember ? sessionStorage : localStorage).removeItem("user");
    window.dispatchEvent(new Event("auth:changed"));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token"); localStorage.removeItem("user");
    sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:changed"));
  };

  const value = useMemo(() => ({ user, token, isAuthed, login, logout }), [user, token, isAuthed]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
