import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch {
        setMsg("Job not found.");
      }
    })();
  }, [id]);

  const apply = async () => {
    try {
      await api.post(`/applications/${job._id}`, {});
      setMsg("Applied successfully!");
    } catch {
      setMsg("Failed to apply. Are you logged in?");
    }
  };

  const save = () => {
    try {
      const raw = localStorage.getItem("savedJobs");
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.find(j => j._id === job._id)) {
        arr.push({_id: job._id, title: job.title, company: job.company?.name || job.company, location: job.location});
        localStorage.setItem("savedJobs", JSON.stringify(arr));
      }
      setMsg("Saved!");
    } catch {
      setMsg("Could not save job.");
    }
  };

  if (!job) return <div className="container mt-6"><p>{msg || "Loading..."}</p></div>;

  const companyName = typeof job.company === "object" ? job.company?.name : job.company;

  return (
    <div className="container mt-6">
      <h2>{job.title}</h2>
      <p><strong>Company:</strong> {companyName}</p>
      <p><strong>Location:</strong> {job.location}</p>
      {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
      <div style={{marginTop:12}}>
        <p>{job.description}</p>
      </div>
      <div style={{display:"flex", gap:10, marginTop:16}}>
        <button className="btn btn-primary" onClick={apply}>Apply</button>
        <button className="btn btn-outline-secondary" onClick={save}>Save</button>
      </div>
      {msg && <p style={{marginTop:10}}>{msg}</p>}
    </div>
  );
}
