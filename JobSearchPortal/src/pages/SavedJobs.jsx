import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SavedJobs.css";

const LS_KEY = "savedJobs";

export default function SavedJobs() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const removeOne = (id) => {
    const next = items.filter(j => j._id !== id);
    setItems(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.setItem(LS_KEY, JSON.stringify([]));
  };

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
            {items.map(job => {
              const company = job.company?.name || job.company || "Company";
              const location = job.location || "Flexible";
              const img = job.image || "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60";
              const salary = job.salaryMin && job.salaryMax
                ? `$${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                : null;

              return (
                <li className="saved-card" key={job._id}>
                  <Link to={`/jobs/${job._id}`} className="thumb">
                    <img src={img} alt={company} loading="lazy" />
                  </Link>

                  <div className="saved-body">
                    <Link to={`/jobs/${job._id}`} className="title">
                      {company} is hiring for {job.title}
                    </Link>
                    <div className="meta">
                      <span className="tag">{location}</span>
                      {salary && <span className="tag">{salary}</span>}
                    </div>

                    <div className="actions">
                      <Link to={`/jobs/${job._id}`} className="btn btn--ghost">Details</Link>
                      <button className="btn btn--danger" onClick={() => removeOne(job._id)}>Remove</button>
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
