import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import "./JobDetails.css";


const USE_COLLECTION_ENDPOINTS = true;        
const SAVED_BASE = USE_COLLECTION_ENDPOINTS ? "saved" : "users/me/saved";


const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`jobs/${id}`);
        const doc = data?.job || data?.data?.job || data;
        if (aborted) return;
        if (!doc || !doc._id) {
          setErr("Job not found.");
          setJob(null);
        } else {
          setJob(doc);
          setErr("");
        }
      } catch {
        if (!aborted) { setErr("Unable to load job."); setJob(null); }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [id]);

 
  useEffect(() => {
    if (!job?._id) return;
    let aborted = false;
    (async () => {
      try {
        
        if (USE_COLLECTION_ENDPOINTS) {
          const { data } = await api.get(`${SAVED_BASE}/${job._id}`);
          if (!aborted) setIsSaved(Boolean(data?.saved));
          return;
        }
        
        const { data } = await api.get(SAVED_BASE);
        const items = Array.isArray(data?.items) ? data.items
                    : Array.isArray(data?.saved) ? data.saved
                    : Array.isArray(data) ? data
                    : [];
        const ids = items.map(x => (typeof x === "string" ? x : x?._id)).filter(Boolean);
        if (!aborted) setIsSaved(ids.includes(job._id));
      } catch {
        if (!aborted) setIsSaved(false); 
      }
    })();
    return () => { aborted = true; };
  }, [job?._id]);

  const toggleSave = async () => {
    if (!job?._id || saving) return;
    setSaving(true);
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      if (USE_COLLECTION_ENDPOINTS) {
        if (prev) {
          await api.delete(`${SAVED_BASE}/${job._id}`);
        } else {
          await api.post(`${SAVED_BASE}/${job._id}`);
        }
      } else {
        if (prev) {
          await api.delete(SAVED_BASE, { data: { jobId: job._id } });
        } else {
          await api.post(SAVED_BASE, { jobId: job._id });
        }
      }
    } catch (e) {
      setIsSaved(prev);
      const msg = e?.response?.data?.message || (prev ? "Failed to remove from saved" : "Failed to save job");
      console.error(msg);
      if (e?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details page">
        <p className="muted">Loading job…</p>
      </div>
    );
  }

  if (err || !job) {
    return (
      <div className="job-details page">
        <p className="err">{err || "Job not found."}</p>
        <button className="btn" onClick={() => navigate("/jobs")}>Back to Jobs</button>
      </div>
    );
  }

  const company =
    job.companyName ||
    (typeof job.company === "object" ? job.company?.name : job.company) ||
    "Company";

  const badge = job.location || job.type || job.workMode || job.employmentType || "Flexible";
  const posted =
    job.postedAt || job.createdAt ? new Date(job.postedAt || job.createdAt).toLocaleString() : "";

  return (
    <div className="job-details page">
      <nav className="breadcrumbs">
        <Link to="/jobs">← Back to jobs</Link>
      </nav>

      <header className="jd-head">
        <h1 className="jd-title">{job.title}</h1>
        <div className="jd-meta">
          <span className="jd-company">{company}</span>
          <span className="dot">•</span>
          <span className="jd-badge">{badge}</span>
          {posted && (
            <>
              <span className="dot">•</span>
              <span className="jd-posted">Posted {posted}</span>
            </>
          )}
        </div>
      </header>

      <section className="jd-body card">
        {job.image && (
          <img className="jd-image" src={job.image} alt={company} loading="lazy" />
        )}

        <div className="jd-actions" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            className={`btn ${isSaved ? "btn--ghost" : ""}`}
            onClick={toggleSave}
            disabled={saving}
            title={isSaved ? "Remove from saved" : "Save this job"}
          >
            {saving ? "Saving…" : isSaved ? "Saved ✓" : "Save job"}
          </button>
        </div>

        <h3>About the role</h3>
        <p className="jd-desc">{stripHtml(job.description || "Description coming soon.")}</p>

        <div className="jd-tags">
          {job.role && <span className="tag">{job.role}</span>}
          {job.level && <span className="tag">{job.level}</span>}
          {job.type && <span className="tag">{job.type}</span>}
          {typeof job.experienceYears === "number" && (
            <span className="tag">{job.experienceYears} yrs exp</span>
          )}
          {job.salaryMin && job.salaryMax && (
            <span className="tag">
              ${Number(job.salaryMin).toLocaleString()}–${Number(job.salaryMax).toLocaleString()} / {job.salaryPeriod || "month"}
            </span>
          )}
        </div>

        <div className="jd-actions">
          {job.url ? (
            <a className="btn" href={job.url} target="_blank" rel="noopener noreferrer">
              Apply on company site
            </a>
          ) : (
            <button className="btn" disabled title="External apply link not provided">
              Apply
            </button>
          )}
          <Link to="/jobs" className="btn btn--ghost">Back to Jobs</Link>
        </div>
      </section>
    </div>
  );
}
