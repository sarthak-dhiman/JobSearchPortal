import React, { useState } from "react";
import api from "../utils/api";
import "./Recruiter.css";

const initial = {
  title: "",
  description: "",
  companyName: "",
  location: "",
  type: "",                
  role: "fullstack",     
  level: "mid",          
  salaryMin: "",
  salaryMax: "",
  salaryPeriod: "month",  
  experienceYears: "",
  url: "",
  image: "",
  postedAt: "",            
};

export default function RecruiterPost() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) {
      setMsg("Title is required");
      return;
    }

    try {
      setSaving(true);

    
      const payload = {
        title: form.title.trim(),
        description: form.description,
        companyName: form.companyName.trim() || undefined,
        location: form.location.trim(),
        type: form.type || "",
        role: form.role,
        level: form.level,
        salaryMin: form.salaryMin !== "" ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax !== "" ? Number(form.salaryMax) : null,
        salaryPeriod: form.salaryPeriod || "month",
        experienceYears: form.experienceYears !== "" ? Number(form.experienceYears) : 0,
        url: form.url.trim(),
        image: form.image.trim(),
        postedAt: form.postedAt ? new Date(form.postedAt) : undefined,
      };

      await api.post("jobs", payload);
      setForm(initial);
      setMsg("Job posted!");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to post job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rec-page">
      <h2>Post a Job</h2>
      {msg && <p className="note">{msg}</p>}
      <form className="rec-form" onSubmit={onSubmit}>
        <input
          className="inp"
          name="title"
          placeholder="Job title *"
          value={form.title}
          onChange={onChange}
          required
        />

        <textarea
          className="inp"
          name="description"
          placeholder="Job description (HTML allowed)"
          rows={6}
          value={form.description}
          onChange={onChange}
        />

        <div className="grid3">
          <input
            className="inp"
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={onChange}
          />
          <input
            className="inp"
            name="location"
            placeholder="Location (e.g., United States / Remote)"
            value={form.location}
            onChange={onChange}
          />
          <select className="inp" name="type" value={form.type} onChange={onChange}>
            <option value="">Job type (optional)</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="grid3">
          <select className="inp" name="role" value={form.role} onChange={onChange}>
            <option value="fullstack">Full-stack</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="data">Data</option>
            <option value="pm">Product Manager</option>
            <option value="design">Designer</option>
          </select>

          <select className="inp" name="level" value={form.level} onChange={onChange}>
            <option value="intern">Intern</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>

          <input
            className="inp"
            name="experienceYears"
            type="number"
            min="0"
            step="1"
            placeholder="Experience (years)"
            value={form.experienceYears}
            onChange={onChange}
          />
        </div>

        <div className="grid3">
          <input
            className="inp"
            name="salaryMin"
            type="number"
            min="0"
            step="100"
            placeholder="Salary min"
            value={form.salaryMin}
            onChange={onChange}
          />
          <input
            className="inp"
            name="salaryMax"
            type="number"
            min="0"
            step="100"
            placeholder="Salary max"
            value={form.salaryMax}
            onChange={onChange}
          />
          <select className="inp" name="salaryPeriod" value={form.salaryPeriod} onChange={onChange}>
            <option value="month">per month</option>
            <option value="year">per year</option>
          </select>
        </div>

        <div className="grid3">
          <input
            className="inp"
            name="url"
            placeholder="External apply URL (optional)"
            value={form.url}
            onChange={onChange}
          />
          <input
            className="inp"
            name="image"
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={onChange}
          />
          <input
            className="inp"
            name="postedAt"
            type="date"
            value={form.postedAt}
            onChange={onChange}
            title="Posted date (optional)"
          />
        </div>

        <button className="btn" disabled={saving}>
          {saving ? "Posting…" : "Post Job"}
        </button>
      </form>
    </div>
  );
}
