import React, { useEffect, useState } from "react";
import { getOrCreateUserProfile, updateUserProfile } from "./firebase";
import moment from "moment-timezone";

// PUBLIC_INTERFACE
export default function UserProfileModal({ open, uid, onClose, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    name: "",
    photoURL: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !uid) return;
    setLoading(true);
    getOrCreateUserProfile(uid).then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, [open, uid]);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await updateUserProfile(uid, profile);
    setLoading(false);
    if (onProfileUpdated) onProfileUpdated(profile);
    onClose();
  }

  if (!open) return null;

  const timezones = moment.tz.names();

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        background: "rgba(32,32,36,0.80)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        style={{
          minWidth: 340,
          background: "linear-gradient(145deg,#23272E,#212124)",
          color: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 40px #000b",
          padding: "28px 24px 26px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          border: `2.2px solid #31d3b8`
        }}
        onSubmit={handleSubmit}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          Edit Profile
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13 }}>Display Name</span>
          <input
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            required
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
          <span style={{ fontSize: 13 }}>Profile Image URL</span>
          <input
            name="photoURL"
            type="url"
            value={profile.photoURL}
            onChange={handleChange}
            placeholder="https://your-avatar-url"
            style={{
              padding: "7.5px 10px",
              border: "1px solid #656575",
              borderRadius: 4,
              background: "#252634",
              color: "white"
            }}
          />
          {profile.photoURL &&
            <img
              src={profile.photoURL}
              alt="Profile"
              style={{
                width: 64,
                height: 64,
                marginTop: 8,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #31d3b8"
              }}
            />
          }
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13 }}>Timezone</span>
          <select
            name="timezone"
            value={profile.timezone}
            onChange={handleChange}
            required
            style={{
              padding: "8px",
              border: "1px solid #656575",
              borderRadius: 4,
              background: "#252634",
              color: "white"
            }}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#bbb",
              border: "none",
              padding: "8px 12px",
              borderRadius: 4,
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{
              background: "#e87a41",
              color: "white",
              border: "none",
              padding: "8px 20px",
              borderRadius: 4,
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
