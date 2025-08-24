import React, { useEffect, useState } from "react";
import api from "../utils/api";           //
import "./Admin.css";


const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function Admin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("jobs", { params: { limit: 50, sort: "-createdAt" } });
      const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setJobs(list);
    } catch (err) {
      console.error("Error fetching jobs:", err?.response?.data || err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await api.post("jobs", {
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      await fetchJobs();
      alert("Job created!");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create job.");
    }
  };

  const list = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="admin">
      <h2 className="admin__title">Admin Panel</h2>

      <form className="admin__form" onSubmit={createJob}>
        <input
          className="inp"
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="inp inp--area"
          placeholder="Job Description (HTML allowed, will be sanitized in list)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
        <button className="btn" type="submit">Add Job</button>
      </form>

      <div className="admin__head">
        <h3>All Jobs</h3>
        {loading && <span className="muted">Loading…</span>}
      </div>

      {list.length === 0 ? (
        <p className="muted">No jobs yet.</p>
      ) : (
        <ul className="jobgrid">
          {list.map((j) => {
            const company = j.company?.name || j.companyName || j.company || "Company";
            const when = j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "";
            const location = j.location || j.workMode || j.employmentType || "Flexible";
            const text = stripHtml(j.description || "");
            return (
              <li key={j._id || j.url || j.title} className="jobcard">
                <div className="jobcard__top">
                  <h4 className="jobcard__title">{j.title}</h4>
                  <span className="badge">{location}</span>
                </div>
                <div className="jobcard__meta">
                  <span>{company}</span>
                  {when && <span> • {when}</span>}
                </div>
                <p className="jobcard__desc">{text || "No description."}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
