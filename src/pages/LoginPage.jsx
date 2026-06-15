import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import AuthShell from "./components/AuthShell";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back.");
      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Unlock your password vault"
      description="Sign in to access only the credentials that belong to your account."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>
        <button className="button button-primary button-full" disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">
        New to PassOP? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
