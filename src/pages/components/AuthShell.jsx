import { useTheme } from "../../context/ThemeContext";

const AuthShell = ({ children, description, eyebrow, title }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className="auth-page">
      <button className="auth-theme-toggle" type="button" onClick={toggleTheme}>
        {isDark ? "Light mode" : "Dark mode"}
      </button>
      <section className="auth-intro">
        <div className="brand brand-large">
          <span aria-hidden="true">&lt;</span>
          Pass<strong>OP</strong>
          <span aria-hidden="true">/&gt;</span>
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="auth-security-note">
          <strong>AES-256-GCM encrypted</strong>
          <span>Authenticated sessions and isolated user data</span>
        </div>
      </section>
      <section className="auth-card">{children}</section>
    </main>
  );
};

export default AuthShell;
