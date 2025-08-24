import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";                   
import "./SavedJobs.css";

const LS_KEY = "savedJobs";

export default function SavedJobs() {
  const [items, setItems] = useState([]);
  const [useRemote, setUseRemote] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("saved", { params: { page: 1, limit: 50 } });
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        if (!aborted) {
          setItems(list);
          setUseRemote(true);
        }
      } catch (e) {
        try {
          const raw = localStorage.getItem(LS_KEY);
          const list = raw ? JSON.parse(raw) : [];
          if (!aborted) {
            setItems(Array.isArray(list) ? list : []);
            setUseRemote(false);
          }
        } catch {
          if (!aborted) setItems([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  const removeOne = async (id) => {
    if (!id) return;
    if (useRemote) {
      try {
        await api.delete(`saved/${id}`);
        setItems((prev) => prev.filter((j) => j._id !== id));
      } catch (e) {
        if (e?.response?.status === 401) navigate("/login");
      }
    } else {
      const next = items.filter((j) => j._id !== id);
      setItems(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  };

  const clearAll = async () => {
    if (useRemote) {
      try {
        await Promise.all(items.map((j) => api.delete(`saved/${j._id}`).catch(() => null)));
      } catch { /* ignore */ }
      setItems([]);
    } else {
      setItems([]);
      localStorage.setItem(LS_KEY, JSON.stringify([]));
    }
  };

  if (loading) {
    return (
      <div className="saved-page">
        <div className="saved-container">
          <p className="muted">Loading saved jobs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-container">
        <header className="saved-hero">
          <h1>Your <span className="accent">Saved Jobs</span></h1>
          {!!items.length && (
            <button className="btn btn--ghost" onClick={clearAll}>Clear all</button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="empty">
            <h3>No saved jobs yet</h3>
            <p>Browse jobs and tap <strong>Save</strong> to keep them here.</p>
            <Link to="/jobs" className="btn">Browse jobs</Link>
          </div>
        ) : (
          <ul className="saved-list">
            {items.map((job) => {
              const company = job.company?.name || job.companyName || job.company || "Company";
              const location = job.location || job.workMode || job.employmentType || "Flexible";
              const img =
                job.image || "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60";
              const salary =
                job.salaryMin && job.salaryMax
                  ? `$${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                  : null;
              const id = job._id || job.id;

              return (
                <li className="saved-card" key={id || job.url || job.title}>
                  <Link to={id ? `/jobs/${id}` : "/jobs"} className="thumb">
                    <img src={img} alt={company} loading="lazy" />
                  </Link>

                  <div className="saved-body">
                    <Link to={id ? `/jobs/${id}` : "/jobs"} className="title">
                      {company} is hiring for {job.title}
                    </Link>
                    <div className="meta">
                      <span className="tag">{location}</span>
                      {salary && <span className="tag">{salary}</span>}
                    </div>

                    <div className="actions">
                      {id ? (
                        <Link to={`/jobs/${id}`} className="btn btn--ghost">Details</Link>
                      ) : (
                        <a href={job.url || "#"} className="btn btn--ghost" target="_blank" rel="noreferrer">
                          Details
                        </a>
                      )}
                      <button className="btn btn--danger" onClick={() => removeOne(id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
