import React, { useEffect, useState } from "react";
import API from "../api/axios";

const Admin = () => {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", { title, description });
      alert("Job created!");
      fetchJobs();
    } catch (err) {
      alert("Failed to create job.");
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <form onSubmit={createJob}>
        <input type="text" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Add Job</button>
      </form>

      <h3>All Jobs</h3>
      <ul>
        {jobs.map((job) => (
          <li key={job._id}>{job.title} - {job.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
