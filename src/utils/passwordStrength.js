export const analyzePassword = (password = "") => {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };

  let score = Math.min(password.length * 4, 40);
  score += Object.values(checks).slice(1).filter(Boolean).length * 10;
  if (/(.)\1{2,}/.test(password)) score -= 10;
  score = Math.max(0, Math.min(100, score));

  let label = "Weak";
  if (score >= 80) label = "Very Strong";
  else if (score >= 60) label = "Strong";
  else if (score >= 35) label = "Medium";

  const suggestions = [];
  if (!checks.length) suggestions.push("Use at least 12 characters.");
  if (!checks.uppercase) suggestions.push("Add an uppercase letter.");
  if (!checks.lowercase) suggestions.push("Add a lowercase letter.");
  if (!checks.numbers) suggestions.push("Add a number.");
  if (!checks.symbols) suggestions.push("Add a symbol.");

  return { checks, label, score, suggestions };
};
