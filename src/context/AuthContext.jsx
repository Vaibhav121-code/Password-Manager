import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest("/auth/me", { suppressUnauthorizedEvent: true })
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      user,
      async login(credentials) {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: credentials,
          suppressUnauthorizedEvent: true,
        });
        setUser(data.user);
        return data.user;
      },
      async register(details) {
        const data = await apiRequest("/auth/register", {
          method: "POST",
          body: details,
          suppressUnauthorizedEvent: true,
        });
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await apiRequest("/auth/logout", { method: "POST" });
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
};
