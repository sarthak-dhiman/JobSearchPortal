import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./Application.css";

export default function RecruiterApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("applications/for-my-jobs", { params: { limit: 50 } });
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rec-page">
      <h2>Applications for My Jobs</h2>
      {loading && <p className="muted">Loading…</p>}
      {err && <p className="note">{err}</p>}
      {(!loading && items.length === 0) ? <p className="muted">No applications yet.</p> : null}
      <ul className="rec-list">
        {items.map(a => (
          <li key={a._id} className="rec-item">
            <div className="rec-main">
              <div className="rec-title">{a.job?.title || "Job"}</div>
              <div className="rec-sub">
                {a.user?.name} • {a.user?.email} • {a.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
