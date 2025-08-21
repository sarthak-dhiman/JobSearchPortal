import React, { useEffect, useRef, useState } from "react";
import api from "../utils/api";
import "./Profile.css";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get("/users/me");
      setMe(data);
    } catch (e) {
      setErr("Please log in to view your profile.");
    }
  };

  useEffect(() => { load(); }, []);

  const saveName = async () => {
    if (!me?.name?.trim()) return;
    try {
      setSaving(true);
      await api.put("/users/me", { name: me.name.trim() });
    } catch (e) {
      setErr(e.response?.data?.message || "Could not save name");
    } finally {
      setSaving(false);
      load();
    }
  };

  const onPickFile = () => fileRef.current?.click();

  const uploadResume = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErr("Please upload a PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10 MB
      setErr("Max file size is 10 MB.");
      return;
    }
    try {
      setErr(""); setUploading(true);
      const fd = new FormData();
      fd.append("resume", file);
      await api.post("/users/me/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async () => {
    try {
      await api.delete("/users/me/resume");
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Delete failed");
    }
  };

  if (err && !me) return <div className="profile-page"><p className="err">{err}</p></div>;
  if (!me) return <div className="profile-page"><p>Loading…</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-head">
          <h1>Profile</h1>
        </header>

        {err && <p className="err">{err}</p>}

        <section className="card">
          <h3>Account</h3>
          <div className="grid2">
            <label>
              <span className="lbl">Name</span>
              <input
                className="input"
                value={me.name || ""}
                onChange={(e) => setMe({ ...me, name: e.target.value })}
              />
            </label>
            <label>
              <span className="lbl">Email</span>
              <input className="input" value={me.email || ""} disabled />
            </label>
          </div>
          <div className="row">
            <span className="muted">Role: {me.role}</span>
            <button className="btn" disabled={saving} onClick={saveName}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </section>

        <section className="card">
          <h3>Resume</h3>

          {me.resume?.url ? (
            <>
              <div className="resume-row">
                <div>
                  <div className="resume-name">{me.resume.originalName}</div>
                  <div className="muted">
                    {(me.resume.size / 1024 / 1024).toFixed(2)} MB · updated{" "}
                    {me.resume.updatedAt ? new Date(me.resume.updatedAt).toLocaleString() : ""}
                  </div>
                </div>
                <div className="gap">
                  <a className="btn btn--ghost" href={me.resume.url} target="_blank" rel="noreferrer">View</a>
                  <button className="btn btn--danger" onClick={deleteResume}>Delete</button>
                </div>
              </div>
              <div className="sep" />
              <button className="btn" onClick={onPickFile} disabled={uploading}>
                {uploading ? "Uploading…" : "Replace PDF"}
              </button>
            </>
          ) : (
            <>
              <p className="muted">No resume uploaded yet (PDF only, max 10 MB).</p>
              <button className="btn" onClick={onPickFile} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload PDF"}
              </button>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => uploadResume(e.target.files?.[0])}
          />
        </section>
      </div>
    </div>
  );
}
