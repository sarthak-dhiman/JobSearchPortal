import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/filters");
        const arr = (data?.companies || []).filter(Boolean);
        setCompanies(arr);
      } catch {
        setCompanies([]);
      }
    })();
  }, []);

  return (
    <div className="container mt-6">
      <h2>Companies</h2>
      {!companies.length ? (
        <p>No companies found.</p>
      ) : (
        <ul className="list-group mt-3">
          {companies.map((c) => (
            <li key={c} className="list-group-item">
              <Link to={`/jobs?company=${encodeURIComponent(c)}`}>{c}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
