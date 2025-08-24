import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import "./Home.css";

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const clamp = (s = "", n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("jobs", { params: { limit: 6, sort: "-createdAt" } });
        const items =
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.jobs) ? data.jobs :
          Array.isArray(data?.results) ? data.results :
          Array.isArray(data?.docs) ? data.docs :
          Array.isArray(data) ? data : [];
        setFeatured(items);
      } catch (e) {
        console.error("Failed to load featured jobs:", e?.response?.data || e.message);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/jobs?q=${encodeURIComponent(term)}` : "/jobs");
  };

  const list = Array.isArray(featured) ? featured : [];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">
            Find Your Next <span className="accent">Career Move</span>
          </h1>
          <p className="hero__subtitle">
            Search thousands of curated roles across companies and locations.
          </p>

          <form className="hero__search" onSubmit={onSearch}>
            <input
              className="hero__input"
              placeholder="Search roles, skills, companies…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="hero__btn" type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="quick">
        <h2 className="section__title">Explore</h2>

        <div className="chips">
          <Link to="/jobs?type=remote" className="chip">
            <img src="/src/assets/work-from-home.png" alt="" className="chip__img" /> Remote
          </Link>

          <Link to="/jobs?location=United%20States" className="chip">
            <img src="/src/assets/usa.png" alt="" className="chip__img" /> United States
          </Link>

          <Link to="/jobs?location=United%20Kingdom" className="chip">
            <img src="/src/assets/uk.png" alt="" className="chip__img" /> United Kingdom
          </Link>

          <Link to="/jobs?company=Google" className="chip">
            <img src="/src/assets/google.png" alt="" className="chip__img" /> Google
          </Link>

          <Link to="/jobs?company=Microsoft" className="chip">
            <img src="/src/assets/microsoft.png" alt="" className="chip__img" /> Microsoft
          </Link>

          <Link to="/companies" className="chip">
            <img src="/src/assets/ra.png" alt="" className="chip__img" /> All Companies
          </Link>
        </div>
      </section>

      {/* FEATURED */}
      <section className="featured">
        <div className="featured__head">
          <h2 className="section__title">Featured Jobs</h2>
          <Link to="/jobs" className="viewall">View all jobs →</Link>
        </div>

        {loading ? (
          <p className="muted center">Loading featured jobs…</p>
        ) : list.length === 0 ? (
          <p className="muted center">No featured jobs yet.</p>
        ) : (
          <div className="grid">
            {list.map((j) => {
              const company =
                j.companyName || (typeof j.company === "object" ? j.company?.name : j.company);
              const badge = j.location || j.type || j.workMode || j.employmentType || "Flexible";
              const desc = clamp(stripHtml(j.description || ""), 110);

              return (
                <Link key={j._id || j.url || j.title} to={`/jobs/${j._id || ""}`} className="card">
                  <div className="card__top">
                    <h3 className="card__title">{j.title}</h3>
                    <span className="badge">{badge}</span>
                  </div>
                  <p className="card__meta">{company}</p>
                  <p className="card__desc">{desc || "Role description coming soon…"}</p>
                  <div className="card__actions">
                    <span className="btn btn--ghost">Details</span>
                    <span className="btn">Apply</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <h2 className="section__title">How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step__num">1</div>
            <h4>Create an account</h4>
            <p>Register and set up your profile to get personalized results.</p>
          </div>
          <div className="step">
            <div className="step__num">2</div>
            <h4>Search & filter</h4>
            <p>Use the search bar, locations, and companies to narrow down roles.</p>
          </div>
          <div className="step">
            <div className="step__num">3</div>
            <h4>Apply & track</h4>
            <p>Apply in one click and manage your saved jobs from your dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__box">
          <h3>Ready to get started?</h3>
          <p>Create a free account and unlock all features.</p>
          <div className="cta__actions">
            <Link to="/register" className="btn">Sign up</Link>
            <Link to="/jobs" className="btn btn--ghost">Browse jobs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
