import React, { useState } from "react";
import { auth, GoogleAuthProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

// PUBLIC_INTERFACE
export default function AuthModal({ open, onClose, setUserProfile }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await cred.user.updateProfile({ displayName });
      }
      onClose();
    } catch (e) {
      setErr(e.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setErr("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (e) {
      setErr(e.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        background: "rgba(32,32,36,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          minWidth: 320,
          background: "linear-gradient(145deg,#23272E,#212124)",
          color: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 40px #000b",
          padding: "34px 26px 26px 26px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          border: `2.2px solid #31d3b8`
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>
          {mode === "login" ? "Sign in" : "Sign up"}
        </div>
        {err && <div style={{ color: "#e53935", fontWeight: 500, fontSize: 14 }}>{err}</div>}
        {mode === "signup" && (
          <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13 }}>Name</span>
            <input
              required
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={{
                padding: "7.5px 10px",
                border: "1px solid #656575",
                borderRadius: 4,
                background: "#252634",
                color: "white"
              }}
            />
          </label>
        )}
        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13 }}>Email</span>
          <input
            required
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              padding: "7.5px 10px",
              border: "1px solid #656575",
              borderRadius: 4,
              background: "#252634",
              color: "white"
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13 }}>Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              padding: "7.5px 10px",
              border: "1px solid #656575",
              borderRadius: 4,
              background: "#252634",
              color: "white"
            }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            background: "#31d3b8",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1em",
            borderRadius: 5,
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
        </button>
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            className="btn"
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{
              background: "#fff",
              color: "#23272E",
              fontWeight: 600,
              marginTop: 2,
              fontSize: "1em",
              borderRadius: 5,
              border: "none",
              width: "100%",
              boxShadow: "0 2px 8px #0002"
            }}
          >
            {loading ? "Please wait..." : "Continue with Google"}
          </button>
        </div>
        <div style={{ fontSize: 14, color: "#bbb", textAlign: "center", marginTop: 4 }}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <a href="/" style={{ color: "#e87a41", cursor: "pointer" }}
                 onClick={e => { e.preventDefault(); setMode("signup"); }}
              >Sign up</a>
            </>
          ) : (
            <>
              Already registered?{" "}
              <a href="/" style={{ color: "#e87a41", cursor: "pointer" }}
                 onClick={e => { e.preventDefault(); setMode("login"); }}
              >Sign in</a>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
