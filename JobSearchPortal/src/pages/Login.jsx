import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";   // ← use context
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();                     

  useEffect(() => {
    document.body.classList.add("auth-no-scroll", "auth-bg");
    emailRef.current?.focus();
    return () => document.body.classList.remove("auth-no-scroll", "auth-bg");
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (ev) => {
    setForm({ ...form, [ev.target.name]: ev.target.value });
    if (errors[ev.target.name]) setErrors({ ...errors, [ev.target.name]: "" });
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerErr("");
    if (!validate()) return;

    try {
      setLoading(true);
   
      const { data } = await api.post("auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      
      if (!data?.token || !data?.user) {
        throw new Error("Malformed response");
      }

    
      login(data.user, data.token, remember);

      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials";
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="glass-card" role="dialog" aria-labelledby="loginTitle" aria-describedby="loginDesc">
        <h2 id="loginTitle" className="card-title">Login</h2>

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <label className="field-label" htmlFor="email">Email :</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={onChange}
            className={"input" + (errors.email ? " input--invalid" : "")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            required
          />
          {errors.email && <p id="email-error" className="err-text" role="alert">{errors.email}</p>}

          <label className="field-label" htmlFor="password">Password :</label>
          <div className="pw-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              className={"input pw-input" + (errors.password ? " input--invalid" : "")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              required
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <p id="password-error" className="err-text" role="alert">{errors.password}</p>}

          {serverErr && <p className="err-text" role="alert">{serverErr}</p>}

          <div className="row-between">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="link small">Forgot password?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Submit"}
          </button>
        </form>

        <p className="muted">
          Not a user?{" "}
          <Link to="/register" className="link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
