import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";  
import Dropdown from "./Dropdown";
import api from "../utils/api";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthed, logout } = useAuth();    
  const [menuOpen, setMenuOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("filters");

        const rawLocs = Array.isArray(data?.locations) ? data.locations : [];
        const rawComps = Array.isArray(data?.companies) ? data.companies : [];

        const uniqLocs = [...new Set(rawLocs.map(String))].filter(Boolean).slice(0, 6);
        const uniqComps = [...new Set(rawComps.map(String))].filter(Boolean).slice(0, 6);

        setLocations(uniqLocs.map(v => ({ label: v, value: v })));
        setCompanies(uniqComps.map(v => ({ label: v, value: v })));
      } catch (e) {
        console.error("Failed to load filters", e);
      }
    })();
  }, []);

  const displayName = (user?.name || user?.user?.name || "Guest").trim();
  const role = user?.role || user?.user?.role || null;
  const initial =
    displayName.split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase() || "U";

  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__left">
          <button className="brand" onClick={() => navigate("/")}>JobSearchPortal</button>
        </div>

        <div className="nav__center">
          <div className="search">
            <span className="search__icon">🔎</span>
            <input
              className="search__input"
              placeholder="Search specific jobs..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = e.currentTarget.value.trim();
                  navigate(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
                }
              }}
            />
          </div>
        </div>

        <div className="nav__right">
          <ul className="nav__list">
            <li><NavLink to="/jobs" className="pill-btn nav__link">Jobs</NavLink></li>
            <li><NavLink to="/saved" className="pill-btn nav__link">Saved Jobs</NavLink></li>
          </ul>

          <Dropdown
            label="Locations"
            items={locations}
            onSelect={(val) => navigate(`/jobs?location=${encodeURIComponent(val)}`)}
          />
          <Dropdown
            label="Companies"
            items={companies}
            onSelect={(val) => navigate(`/jobs?company=${encodeURIComponent(val)}`)}
          />

          <div className="avatar" ref={menuRef}>
            <button className="avatar__btn" onClick={() => setMenuOpen(v => !v)}>
              {initial}
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menu__header">{displayName}</div>

                {(role === "recruiter" || role === "admin") && (
                <>
                <div className="menu__section"></div>
                <NavLink to="/recruiter/post" className="menu__item" onClick={() => setMenuOpen(false)}>
                ➕ Post a Job
                </NavLink>
                <NavLink to="/recruiter/jobs" className="menu__item" onClick={() => setMenuOpen(false)}>
                📋 My Jobs
                </NavLink>
               </>
               )}

                {role === "admin" && (
                  <NavLink to="/admin" className="menu__item" onClick={() => setMenuOpen(false)}>
                    🛠️ Admin
                  </NavLink>
                )}

                {isAuthed ? (
                  <>
                    <NavLink to="/profile" className="menu__item" onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </NavLink>
                    <button className="menu__item menu__danger" onClick={() => { setMenuOpen(false); logout(); navigate("/login"); }}>
                      ↪ Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="menu__item" onClick={() => setMenuOpen(false)}>
                      Login
                    </NavLink>
                    <NavLink to="/register" className="menu__item" onClick={() => setMenuOpen(false)}>
                      Signup
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
