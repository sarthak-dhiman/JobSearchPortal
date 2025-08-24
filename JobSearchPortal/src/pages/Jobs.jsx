import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Jobs.css";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export default function Jobs() {
  const q = useQuery();
  const { search } = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState(q.get("role") || "all");
  const [level, setLevel] = useState(q.get("level") || "all");
  const [type, setType] = useState(q.get("type") || "all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiParams = useMemo(() => {
    const p = {};
    const qStr = q.get("q");
    const locStr = q.get("location");
    const compStr = q.get("company");

    if (qStr) p.q = qStr;
    if (locStr) p.location = locStr;
    if (compStr) {
      p.companyName = compStr;
      p.company = compStr;
    }

    if (type !== "all") {
      p.type = type;
      if (["remote", "onsite", "hybrid"].includes(type)) {
        p.workMode = type;
      } else if (["full-time", "part-time", "contract"].includes(type)) {
        p.employmentType = type;
      }
    }

    if (role !== "all") p.role = role;
    if (level !== "all") p.level = level;
    p.limit = Number(q.get("limit")) || 20;

    return p;
  }, [search, role, level, type, q]);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("jobs", {
          params: apiParams,
          signal: controller.signal,
        });

        if (aborted) return;
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.jobs)) list = data.jobs;
        else if (Array.isArray(data?.data?.jobs)) list = data.data.jobs;
        else if (Array.isArray(data?.results)) list = data.results;
        else if (Array.isArray(data?.docs)) list = data.docs;
        else if (Array.isArray(data?.items)) list = data.items;

        setJobs(list);
      } catch (e) {
        if (!aborted) {
          console.error("jobs fetch failed:", e?.response?.data || e.message || e);
          setJobs([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [JSON.stringify(apiParams)]);

  const updateUrl = (next) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(next).forEach(([k, v]) =>
      v === "all" || v === "" || v == null ? params.delete(k) : params.set(k, v)
    );
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
          <h1>Discover Your Next <span className="accent">Adventure</span></h1>
        </header>

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
              const companyName =
                job.companyName ||
                (typeof job.company === "object" ? job.company?.name : job.company);

              const postedBy = job.postedBy?.name || "Admin";
              const date = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "";
              const salary = formatMoney(job.salaryMin, job.salaryMax, job.salaryPeriod || "month");
              const years = job.experienceYears ?? 0;

              return (
                <li className="job-card" key={job._id || job.url || job.title}>
                  <Link to={`/jobs/${job._id || ""}`} className="thumb">
                    <img
                      src={job.image || "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60"}
                      alt={companyName || job.title}
                      loading="lazy"
                    />
                  </Link>

                  <div className="job-body">
                    <Link to={`/jobs/${job._id || ""}`} className="job-title">
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
