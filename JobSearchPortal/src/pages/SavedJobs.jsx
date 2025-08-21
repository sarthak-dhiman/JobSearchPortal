import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedJobs");
      setJobs(raw ? JSON.parse(raw) : []);
    } catch {
      setJobs([]);
    }
  }, []);

  const remove = (id) => {
    const next = jobs.filter(j => j._id !== id);
    setJobs(next);
    localStorage.setItem("savedJobs", JSON.stringify(next));
  };

  if (!jobs.length) {
    return (
      <div className="container mt-6">
        <h2>Saved Jobs</h2>
        <p>You haven’t saved any jobs yet.</p>
        <button onClick={() => navigate("/jobs")} className="btn btn-primary">Browse Jobs</button>
      </div>
    );
  }

  return (
    <div className="container mt-6">
      <h2>Saved Jobs</h2>
      <ul className="list-group mt-3">
        {jobs.map(job => (
          <li key={job._id} className="list-group-item">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <h5 style={{margin:0}}>{job.title}</h5>
                <small>{job.company} — {job.location}</small>
              </div>
              <div style={{display:"flex", gap:8}}>
                <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-outline-secondary">View</Link>
                <button onClick={() => remove(job._id)} className="btn btn-sm btn-danger">Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export function saveJob(job) {
  const raw = localStorage.getItem("savedJobs");
  const arr = raw ? JSON.parse(raw) : [];
  if (!arr.find(j => j._id === job._id)) {
    arr.push({_id: job._id, title: job.title, company: job.company, location: job.location});
    localStorage.setItem("savedJobs", JSON.stringify(arr));
  }
}