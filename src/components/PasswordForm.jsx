import { useState } from "react";

import PasswordStrengthMeter from "./PasswordStrengthMeter";

const PasswordForm = ({
  editingId,
  form,
  onCancel,
  onChange,
  onGenerate,
  onSubmit,
  saving,
}) => {
  const [visible, setVisible] = useState(false);
  const updateField = (event) => {
    onChange((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <section className="form-card" aria-labelledby="password-form-heading">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">{editingId ? "Update entry" : "New entry"}</p>
          <h2 id="password-form-heading">
            {editingId ? "Edit saved account" : "Save a password"}
          </h2>
        </div>
        {editingId && (
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="password-form">
        <label className="field">
          <span>Website or app</span>
          <input
            autoComplete="url"
            name="site"
            onChange={updateField}
            placeholder="example.com"
            required
            value={form.site}
          />
        </label>

        <label className="field">
          <span>Username or email</span>
          <input
            autoComplete="username"
            name="username"
            onChange={updateField}
            placeholder="name@example.com"
            required
            value={form.username}
          />
        </label>

        <div className="field password-field">
          <span>Password</span>
          <div className="input-with-action">
            <input
              autoComplete="new-password"
              name="password"
              onChange={updateField}
              placeholder={editingId ? "Leave blank to keep current password" : "Enter password"}
              required={!editingId}
              type={visible ? "text" : "password"}
              value={form.password}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? "Hide form password" : "Show form password"}
            >
              {visible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-side-action">
          <button className="button button-secondary" type="button" onClick={onGenerate}>
            Generate secure password
          </button>
        </div>

        <div className="strength-slot">
          {form.password ? (
            <PasswordStrengthMeter password={form.password} />
          ) : editingId ? (
            <p className="field-hint">The stored password remains unchanged when blank.</p>
          ) : null}
        </div>

        <div className="form-submit">
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update entry" : "Save password"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PasswordForm;
