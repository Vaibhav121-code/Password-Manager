import { analyzePassword } from "../utils/passwordStrength";

const PasswordStrengthMeter = ({ password, compact = false }) => {
  const result = analyzePassword(password);
  const className = result.label.toLowerCase().replace(" ", "-");

  return (
    <div className={`strength-meter ${compact ? "compact" : ""}`}>
      <div className="strength-meta">
        <span>Password strength</span>
        <strong className={`strength-${className}`}>{result.label}</strong>
      </div>
      <div
        className="strength-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={result.score}
        aria-label={`Password strength: ${result.label}`}
      >
        <span
          className={`strength-fill strength-${className}`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      {!compact && result.suggestions.length > 0 && (
        <p className="strength-suggestion">{result.suggestions[0]}</p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
