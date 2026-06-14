import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { apiRequest } from "../lib/api";
import GeneratorModal from "./GeneratorModal";
import PasswordForm from "./PasswordForm";
import PasswordList from "./PasswordList";

const emptyForm = { site: "", username: "", password: "" };

const Manager = () => {
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const revealTimers = useRef(new Map());

  const loadPasswords = useCallback(async () => {
    try {
      const data = await apiRequest("/passwords");
      setPasswords(data.passwords);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPasswords();
    const timers = revealTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [loadPasswords]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (!form.site.trim() || !form.username.trim()) {
      toast.error("Site and username are required.");
      return;
    }
    if (!editingId && !form.password) {
      toast.error("A password is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        site: form.site.trim(),
        username: form.username.trim(),
        ...(form.password ? { password: form.password } : {}),
      };
      await apiRequest(editingId ? `/passwords/${editingId}` : "/passwords", {
        method: editingId ? "PUT" : "POST",
        body: payload,
      });
      toast.success(editingId ? "Password entry updated." : "Password saved.");
      resetForm();
      await loadPasswords();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editPassword = (entry) => {
    setEditingId(entry.id);
    setForm({ site: entry.site, username: entry.username, password: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePassword = async (entry) => {
    const confirmed = window.confirm(
      `Delete the password entry for ${entry.site}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/passwords/${entry.id}`, { method: "DELETE" });
      toast.success("Password deleted.");
      if (editingId === entry.id) resetForm();
      await loadPasswords();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const revealPassword = async (entry) => {
    if (revealed[entry.id]) {
      clearTimeout(revealTimers.current.get(entry.id));
      revealTimers.current.delete(entry.id);
      setRevealed((current) => {
        const next = { ...current };
        delete next[entry.id];
        return next;
      });
      return;
    }

    try {
      const data = await apiRequest(`/passwords/${entry.id}/reveal`, {
        method: "POST",
      });
      setRevealed((current) => ({ ...current, [entry.id]: data.password }));

      const timer = setTimeout(() => {
        setRevealed((current) => {
          const next = { ...current };
          delete next[entry.id];
          return next;
        });
        revealTimers.current.delete(entry.id);
      }, 20000);
      revealTimers.current.set(entry.id, timer);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Clipboard access was denied by the browser.");
    }
  };

  return (
    <div className="page-shell vault-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Encrypted personal vault</p>
          <h1>Your credentials, organized and protected.</h1>
          <p className="hero-copy">
            Passwords are encrypted before storage and only decrypted when you
            explicitly reveal them.
          </p>
        </div>
        <div className="hero-stat" aria-label={`${passwords.length} saved accounts`}>
          <strong>{passwords.length}</strong>
          <span>saved accounts</span>
        </div>
      </section>

      <PasswordForm
        editingId={editingId}
        form={form}
        onCancel={resetForm}
        onChange={setForm}
        onGenerate={() => setGeneratorOpen(true)}
        onSubmit={savePassword}
        saving={saving}
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vault</p>
            <h2>Your passwords</h2>
          </div>
          <span className="count-pill">{passwords.length} total</span>
        </div>
        <PasswordList
          loading={loading}
          passwords={passwords}
          revealed={revealed}
          onCopy={copyText}
          onDelete={deletePassword}
          onEdit={editPassword}
          onReveal={revealPassword}
        />
      </section>

      <GeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onUse={(password) => {
          setForm((current) => ({ ...current, password }));
          setGeneratorOpen(false);
          toast.success("Generated password added to the form.");
        }}
      />
    </div>
  );
};

export default Manager;
