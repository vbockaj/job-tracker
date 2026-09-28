import { useState } from "react";
import { signup, login } from "../api";

export default function AuthForm({ onAuth, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login" ? await login(email, password) : await signup(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      onAuth(data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <button className="icon-button theme-toggle-fixed" onClick={onToggleTheme} title="Toggle theme">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="auth-subtitle">Track every job application in one place</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {mode === "signup" && (
          <p className="auth-hint">8+ characters, with an uppercase letter, a lowercase letter, and a number</p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <p className="auth-switch">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button type="button" className="link-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}