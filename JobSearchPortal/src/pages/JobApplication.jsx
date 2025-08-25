import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./Application.css";

const STATUSES = ["applied", "review", "accepted", "rejected"];

export default function JobApplications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`applications/job/${jobId}`);
      setJob(data.job || null);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();  }, [jobId]);

  const setStatus = async (appId, status) => {
    try {
      await api.patch(`applications/${appId}`, { status });
      setItems(prev => prev.map(a => (a._id === appId ? { ...a, status } : a)));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="apps-page">
      <div className="apps-head">
        <h2>Applications • {job?.title || "Job"}</h2>
        {loading && <span className="muted">Loading…</span>}
      </div>
      {err && <p className="note">{err}</p>}

      <ul className="apps-list">
        {items.map((a) => (
          <li className="app-card" key={a._id}>
            <div className="app-top">
              <div className="app-title">{a.user?.name || "Candidate"}</div>
              <span className={`app-status ${a.status}`}>{a.status}</span>
            </div>
            <div className="app-meta">{a.user?.email}</div>
            {a.coverLetter && <p className="app-cover">{a.coverLetter}</p>}
            {a.resumeUrl && (
              <p className="app-cover">
                <a href={a.resumeUrl} target="_blank" rel="noreferrer">Open resume</a>
              </p>
            )}

            <div className="app-actions">
              <label className="muted" htmlFor={`status-${a._id}`}>Set status:</label>
              <select
                id={`status-${a._id}`}
                value={a.status}
                onChange={(e) => setStatus(a._id, e.target.value)}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && <p className="muted">No applications yet.</p>}
    </div>
  );
}
