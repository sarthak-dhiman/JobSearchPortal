import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Dropdown from "./Dropdown";
import api from "../utils/api";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const uStr = localStorage.getItem("user");
    const rStr = localStorage.getItem("role");
    if (uStr) {
      const u = JSON.parse(uStr);
      setUser(u);
      setRole(rStr || u?.role || u?.user?.role || null);
    } else if (rStr) setRole(rStr);

  
    const onDocClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

 
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/filters");
        setLocations((data.locations || []).map((v) => ({ label: v, value: v })));
        setCompanies((data.companies || []).map((v) => ({ label: v, value: v })));
      } catch (e) {
        
        console.error("Failed to load filters", e);
      }
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    setMenuOpen(false);
    navigate("/login");
  };

  const displayName = user?.user?.name || user?.name || "Guest";
  const initial = displayName?.[0]?.toUpperCase() || "U";

  return (
    <header className="nav">
      <div className="nav__inner">
        {}
        <div className="nav__left">
          <button className="brand" onClick={() => navigate("/")}>JobSearchPortal</button>
        </div>

        {}
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

        {}
        <div className="nav__right">
          <ul className="nav__list">
            <li><NavLink to="/jobs?type=remote" className="pill-btn nav__link">Remote Jobs</NavLink></li>
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

          {}
          <div className="avatar" ref={menuRef}>
            <button className="avatar__btn" onClick={() => setMenuOpen((v) => !v)}>
              {initial}
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menu__header">{displayName}</div>
                {role === "admin" && (
                  <NavLink to="/admin" className="menu__item" onClick={() => setMenuOpen(false)}>
                    🛠️ Admin
                  </NavLink>
                )}
                {user ? (
                  <>
                    <NavLink to="/profile" className="menu__item" onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </NavLink>
                    <button className="menu__item menu__danger" onClick={logout}>
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
