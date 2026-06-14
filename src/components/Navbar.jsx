import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("You have been logged out.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="app-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <NavLink to="/" className="brand" aria-label="PassOP home">
          <span aria-hidden="true">&lt;</span>
          Pass<strong>OP</strong>
          <span aria-hidden="true">/&gt;</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end>
            Vault
          </NavLink>
          <NavLink to="/security">Security</NavLink>
        </div>

        <div className="nav-actions">
          <button
            className="icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? "Light" : "Dark"}
          </button>
          <div className="user-chip" title={user?.email}>
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="button button-quiet" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
