import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuth } from "../context/AuthContext";
import AuthShell from "./components/AuthShell";

const initialForm = { name: "", email: "", password: "", confirmPassword: "" };

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      toast.success("Your secure vault is ready.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.errors?.[0]?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create your vault"
      title="Start with a protected account"
      description="Your account separates your encrypted credentials from every other user."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            autoComplete="name"
            minLength="2"
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="new-password"
            minLength="8"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        {form.password && <PasswordStrengthMeter password={form.password} />}
        <label className="field">
          <span>Confirm password</span>
          <input
            autoComplete="new-password"
            minLength="8"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            required
          />
        </label>
        <p className="field-hint">
          Use at least 8 characters with uppercase, lowercase, a number, and a symbol.
        </p>
        <button className="button button-primary button-full" disabled={submitting} type="submit">
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
