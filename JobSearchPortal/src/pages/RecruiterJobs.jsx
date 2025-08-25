import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./Recruiter.css";

export default function RecruiterJobs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("jobs/mine", { params: { limit: 50 } }); 
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!id) return;
    if (!confirm("Delete this job?")) return;
    await api.delete(`jobs/${id}`);
    setItems((prev) => prev.filter((j) => j._id !== id));
  };

  return (
    <div className="rec-page">
      <div className="rec-head">
        <h2>My Jobs</h2>
        {loading && <span className="muted">Loading…</span>}
      </div>
      {items.length === 0 ? (
        <p className="muted">You haven’t posted any jobs yet.</p>
      ) : (
        <ul className="rec-list">
          {items.map((j) => (
            <li key={j._id} className="rec-item">
              <div className="rec-main">
                <div className="rec-title">{j.title}</div>
                <div className="rec-sub">
                  {(j.companyName || j.company?.name || "Company")} • {j.location || j.type || "Flexible"}
                </div>
              </div>
              <div className="rec-actions">
                {}
                <Link className="btn btn--ghost" to={`/recruiter/jobs/${j._id}/applications`}>
                Applications
                </Link>
                <button className="btn btn--danger" onClick={() => remove(j._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
