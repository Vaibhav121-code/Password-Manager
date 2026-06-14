import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { generatePassword } from "../utils/passwordGenerator";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const defaultOptions = {
  length: 18,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const GeneratorModal = ({ onClose, onUse, open }) => {
  const [options, setOptions] = useState(defaultOptions);
  const [password, setPassword] = useState("");

  const generate = () => {
    try {
      setPassword(generatePassword(options));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (open) {
      try {
        setPassword(generatePassword(options));
      } catch {
        setPassword("");
      }
    }
  }, [open, options]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const toggle = (key) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  const copyGenerated = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Generated password copied.");
    } catch {
      toast.error("Clipboard access was denied by the browser.");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="generator-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Secure generator</p>
            <h2 id="generator-heading">Create a unique password</h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close generator">
            Close
          </button>
        </div>

        <div className="generated-output">
          <code>{password || "Select at least one character type"}</code>
          <button
            className="text-button"
            type="button"
            onClick={copyGenerated}
            disabled={!password}
          >
            Copy
          </button>
        </div>

        <PasswordStrengthMeter password={password} compact />

        <label className="range-field">
          <span>
            Length <strong>{options.length}</strong>
          </span>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                length: Number(event.target.value),
              }))
            }
          />
        </label>

        <div className="generator-options">
          {[
            ["uppercase", "Uppercase letters"],
            ["lowercase", "Lowercase letters"],
            ["numbers", "Numbers"],
            ["symbols", "Symbols"],
          ].map(([key, label]) => (
            <label className="check-option" key={key}>
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggle(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={generate}>
            Generate again
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => onUse(password)}
            disabled={!password}
          >
            Use this password
          </button>
        </div>
      </section>
    </div>
  );
};

export default GeneratorModal;
