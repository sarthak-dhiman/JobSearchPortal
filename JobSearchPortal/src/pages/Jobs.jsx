import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Jobs.css";


const useQuery = () => new URLSearchParams(useLocation().search);

export default function Jobs() {
  const q = useQuery();
  const navigate = useNavigate();

  
  const [role, setRole] = useState(q.get("role") || "all");
  const [level, setLevel] = useState(q.get("level") || "all");
  const [type, setType] = useState(q.get("type") || "all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const apiParams = useMemo(() => {
    const p = {};
    if (q.get("q")) p.q = q.get("q");
    if (q.get("location")) p.location = q.get("location");
    if (q.get("company")) p.company = q.get("company");
    if (type !== "all") p.type = type;                 
    if (role !== "all") p.role = role;                 
    if (level !== "all") p.level = level;              
    return p;
  }, [q, role, level, type]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/jobs", { params: apiParams });
        setJobs(Array.isArray(data) ? data : (data?.jobs || []));
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiParams]);

  // keep URL in sync when local filters change
  const updateUrl = (next) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(next).forEach(([k, v]) => (v === "all" || !v) ? params.delete(k) : params.set(k, v));
    navigate(`/jobs?${params.toString()}`, { replace: true });
  };

  const onRole = (v) => { setRole(v); updateUrl({ role: v }); };
  const onLevel = (v) => { setLevel(v); updateUrl({ level: v }); };
  const onType = (v) => { setType(v); updateUrl({ type: v }); };

  const formatMoney = (a, b, period = "month") =>
    a && b ? `$${a.toLocaleString()} - ${b.toLocaleString()} per ${period}` : null;

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        <header className="jobs-hero">
          <h1>Discover Your Next <span className="accent">Remote Adventure</span></h1>
        </header>

        {/* filter bar */}
        <div className="filters">
          <div className="filter">
            <label>Job Role</label>
            <div className="select-pill">
              <select value={role} onChange={(e) => onRole(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Full-Stack Developer</option>
                <option value="data">Data Analyst</option>
                <option value="pm">Product Manager</option>
                <option value="design">Designer</option>
              </select>
              <span className="chev">⌄</span>
            </div>
          </div>

          <div className="filter">
            <label>Experience Level</label>
            <div className="select-pill">
              <select value={level} onChange={(e) => onLevel(e.target.value)}>
                <option value="all">All Experience</option>
                <option value="intern">Intern</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
              <span className="chev">⌄</span>
            </div>
          </div>

          <div className="filter">
            <label>Job Type</label>
            <div className="select-pill">
              <select value={type} onChange={(e) => onType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
              <span className="chev">⌄</span>
            </div>
          </div>
        </div>

        {/* results */}
        {loading ? (
          <p className="muted center">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="empty">
            <p>No jobs found for your filters.</p>
            <Link to="/jobs" className="btn">Reset filters</Link>
          </div>
        ) : (
          <ul className="job-list">
            {jobs.map((job) => {
              const companyName = typeof job.company === "object" ? job.company?.name : job.company;
              const postedBy = job.postedBy?.name || "Admin";
              const date = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "";
              const salary = formatMoney(job.salaryMin, job.salaryMax, job.salaryPeriod || "month");
              const years = job.experienceYears ?? 0;

              return (
                <li className="job-card" key={job._id}>
                  <Link to={`/jobs/${job._id}`} className="thumb">
                    <img
                      src={job.image || "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60"}
                      alt={companyName || job.title}
                      loading="lazy"
                    />
                  </Link>

                  <div className="job-body">
                    <Link to={`/jobs/${job._id}`} className="job-title">
                      {companyName ? `${companyName} is hiring for ${job.title}` : job.title}
                      {job.type ? ` | ${job.type[0].toUpperCase() + job.type.slice(1)}` : ""}
                    </Link>

                    <div className="meta">
                      <span>{postedBy}</span>
                      {date && <span>• {date}</span>}
                    </div>

                    <div className="tags">
                      {job.type && <span className="tag">{job.type}</span>}
                      {salary && <span className="tag">{salary}</span>}
                      <span className="tag">{years} years</span>
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
