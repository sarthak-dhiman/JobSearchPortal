import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./Application.css";

export default function AdminApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("applications", { params: { limit: 50 } });
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="admin">
      <h2>All Applications</h2>
      {loading && <p className="muted">Loading…</p>}
      {err && <p className="note">{err}</p>}
      {(!loading && items.length === 0) ? <p className="muted">No applications.</p> : null}
      <ul className="jobgrid">
        {items.map(a => (
          <li key={a._id} className="jobcard">
            <div className="jobcard__top">
              <h4 className="jobcard__title">{a.job?.title || "Job"}</h4>
              <span className="badge">{a.status}</span>
            </div>
            <div className="jobcard__meta">
              <span>{a.user?.name}</span> • <span>{a.user?.email}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
