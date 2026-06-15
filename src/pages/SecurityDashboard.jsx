import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiRequest } from "../lib/api";

const emptyMetrics = {
  total: 0,
  strong: 0,
  weak: 0,
  medium: 0,
  veryStrong: 0,
  reusedPasswords: 0,
  reusedPasswordGroups: 0,
};

const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/security/summary")
      .then((data) => setMetrics(data.metrics))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const healthScore =
    metrics.total === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((metrics.strong - metrics.reusedPasswords * 0.5) / metrics.total) * 100,
          ),
        );

  return (
    <div className="page-shell dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Security dashboard</p>
          <h1>See where your vault needs attention.</h1>
          <p>
            Metrics are calculated from stored strength metadata and keyed
            fingerprints. Your passwords stay encrypted.
          </p>
        </div>
        <div className="health-score">
          <span>Vault health</span>
          <strong>{healthScore}%</strong>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner label="Calculating security metrics" />
      ) : (
        <>
          <section className="stats-grid" aria-label="Password security statistics">
            <article className="stat-card">
              <span>Total passwords</span>
              <strong>{metrics.total}</strong>
              <p>Encrypted entries in your vault</p>
            </article>
            <article className="stat-card stat-good">
              <span>Strong passwords</span>
              <strong>{metrics.strong}</strong>
              <p>Rated Strong or Very Strong</p>
            </article>
            <article className="stat-card stat-danger">
              <span>Weak passwords</span>
              <strong>{metrics.weak}</strong>
              <p>Highest priority to replace</p>
            </article>
            <article className="stat-card stat-warning">
              <span>Reused passwords</span>
              <strong>{metrics.reusedPasswords}</strong>
              <p>Across {metrics.reusedPasswordGroups} repeated groups</p>
            </article>
          </section>

          <section className="security-advice">
            <div>
              <p className="eyebrow">Recommended actions</p>
              <h2>Improve your vault health</h2>
            </div>
            <ul>
              <li>
                <strong>Replace reused passwords first.</strong>
                <span>Every account should have a unique credential.</span>
              </li>
              <li>
                <strong>Upgrade weak passwords.</strong>
                <span>Use the generator to create long, mixed-character values.</span>
              </li>
              <li>
                <strong>Review medium passwords.</strong>
                <span>{metrics.medium} entries currently have a Medium rating.</span>
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default SecurityDashboard;
