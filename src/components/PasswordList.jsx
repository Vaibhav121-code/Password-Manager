import LoadingSpinner from "./LoadingSpinner";

const safeSiteUrl = (site) => {
  if (/^https?:\/\//i.test(site)) return site;
  return `https://${site}`;
};

const PasswordList = ({
  loading,
  onCopy,
  onDelete,
  onEdit,
  onReveal,
  passwords,
  revealed,
}) => {
  if (loading) return <LoadingSpinner label="Loading encrypted entries" />;
  if (passwords.length === 0) {
    return (
      <div className="empty-state">
        <strong>Your vault is empty.</strong>
        <p>Add your first account using the form above.</p>
      </div>
    );
  }

  return (
    <div className="credential-grid">
      {passwords.map((entry) => {
        const revealedPassword = revealed[entry.id];
        const strengthClass = entry.strengthLabel.toLowerCase().replace(" ", "-");
        return (
          <article
            className={`credential-card ${entry.isReused ? "credential-card-warning" : ""}`}
            key={entry.id}
          >
            <div className="credential-topline">
              <div className="site-identity">
                <span className="site-avatar" aria-hidden="true">
                  {entry.site.charAt(0).toUpperCase()}
                </span>
                <div>
                  <a
                    href={safeSiteUrl(entry.site)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {entry.site}
                  </a>
                  <span>{entry.username}</span>
                </div>
              </div>
              <span className={`strength-badge strength-${strengthClass}`}>
                {entry.strengthLabel}
              </span>
            </div>

            {entry.isReused && (
              <div className="reuse-warning" role="status">
                Password reused across {entry.reuseCount} accounts
              </div>
            )}

            <div className="credential-row">
              <div>
                <span className="credential-label">Username</span>
                <strong>{entry.username}</strong>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => onCopy(entry.username, "Username")}
              >
                Copy
              </button>
            </div>

            <div className="credential-row password-value">
              <div>
                <span className="credential-label">Password</span>
                <strong>
                  {revealedPassword || "\u2022".repeat(Math.min(entry.passwordLength, 18))}
                </strong>
              </div>
              <div className="row-actions">
                {revealedPassword && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => onCopy(revealedPassword, "Password")}
                  >
                    Copy
                  </button>
                )}
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onReveal(entry)}
                >
                  {revealedPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="credential-actions">
              <button className="button button-secondary" type="button" onClick={() => onEdit(entry)}>
                Edit
              </button>
              <button className="button button-danger" type="button" onClick={() => onDelete(entry)}>
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default PasswordList;
