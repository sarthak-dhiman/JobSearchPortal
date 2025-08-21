import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setMe(data);
      } catch (e) {
        setErr("Please log in to view your profile.");
      }
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (err) return <div className="container mt-6"><p>{err}</p></div>;
  if (!me) return <div className="container mt-6"><p>Loading...</p></div>;

  return (
    <div className="container mt-6">
      <h2>Profile</h2>
      <div style={{marginTop:12}}>
        <p><strong>Name:</strong> {me.name}</p>
        <p><strong>Email:</strong> {me.email}</p>
        <p><strong>Role:</strong> {me.role}</p>
      </div>
      <button className="btn btn-danger mt-3" onClick={logout}>Log out</button>
    </div>
  );
}
