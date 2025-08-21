import React, { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("auth-no-scroll", "auth-bg");
    nameRef.current?.focus();
    return () => document.body.classList.remove("auth-no-scroll", "auth-bg");
  }, []);

  const validate = (state = form) => {
    const e = {};
    if (!state.name.trim()) e.name = "Name is required";
    if (!state.email.trim()) e.email = "Email is required";
    if (!state.password) e.password = "Password is required";
    else if (state.password.length < 6) e.password = "Min 6 characters";
    if (!state.confirm) e.confirm = "Confirm your password";
    else if (state.password !== state.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    setServerErr("");
    if (touched[e.target.name] || submitted) setErrors(validate(next));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate({ ...form }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setServerErr(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const showErr = (k) => ( (touched[k] || submitted) && errors[k] );

  return (
    <div className="auth-wrap register-page">
      <div className="glass-card" role="dialog" aria-labelledby="registerTitle">
        <h2 id="registerTitle" className="card-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="auth-form register-form" noValidate>
          <label className="field-label" htmlFor="name">Name :</label>
          <input
            ref={nameRef}
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange} onBlur={handleBlur}
            className={"input" + (showErr("name") ? " input--invalid" : "")}
            aria-invalid={!!showErr("name")}
          />
          {showErr("name") && <p className="err-inline">{errors.name}</p>}

          <label className="field-label" htmlFor="email">Email :</label>
          <input
            id="email" name="email" type="email" autoComplete="username"
            value={form.email} onChange={handleChange} onBlur={handleBlur}
            className={"input" + (showErr("email") ? " input--invalid" : "")}
            aria-invalid={!!showErr("email")}
          />
          {showErr("email") && <p className="err-inline">{errors.email}</p>}

          <label className="field-label" htmlFor="password">Password :</label>
          <div className="pw-wrap">
            <input
              id="password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
              className={"input pw-input" + (showErr("password") ? " input--invalid" : "")}
              aria-invalid={!!showErr("password")}
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password">
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {showErr("password") && <p className="err-inline">{errors.password}</p>}

          <label className="field-label" htmlFor="confirm">Confirm Password :</label>
          <div className="pw-wrap">
            <input
              id="confirm" name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
              value={form.confirm} onChange={handleChange} onBlur={handleBlur}
              className={"input pw-input" + (showErr("confirm") ? " input--invalid" : "")}
              aria-invalid={!!showErr("confirm")}
            />
            <button type="button" className="pw-toggle" onClick={() => setShowConfirm((s) => !s)} aria-label="Toggle confirm password">
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
          {showErr("confirm") && <p className="err-inline">{errors.confirm}</p>}

          {serverErr && <p className="err-banner">{serverErr}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login" className="link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
