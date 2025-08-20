import React, { createContext, useState, useEffect } from "react";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  
  useEffect(() => {
    if (token) {
      
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data._id) {
            setUser(data);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, [token]);

  
  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    setUser(userData);
  };

  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
