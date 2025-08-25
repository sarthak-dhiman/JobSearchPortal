import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./Application.css";

export default function MyApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("applications/mine");
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="apps-page">
      <div className="apps-head">
        <h2>My Applications</h2>
        {loading && <span className="muted">Loading…</span>}
      </div>
      {err && <p className="note">{err}</p>}
      <ul className="apps-list">
        {items.map((a) => (
          <li className="app-card" key={a._id}>
            <div className="app-top">
              <div className="app-title">{a.job?.title || "Job"}</div>
              <span className={`app-status ${a.status}`}>{a.status}</span>
            </div>
            <div className="app-meta">
              {a.job?.companyName || a.job?.company?.name || "Company"}
              {a.job?.location ? ` • ${a.job.location}` : ""}
            </div>
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && <p className="muted">No applications found.</p>}
    </div>
  );
}
