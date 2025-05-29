import React, { useEffect, useState } from 'react';
import './App.css';
import ColorCategorizedEventScheduler from './ColorCategorizedEventScheduler';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import { auth, fbSignOut, getOrCreateUserProfile } from "./firebase";

/**
 * PUBLIC_INTERFACE
 * Main App with authentication, profile, and event scheduler.
 */
function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        setLoadingProfile(true);
        const p = await getOrCreateUserProfile(fbUser.uid, {
          name: fbUser.displayName || "",
          photoURL: fbUser.photoURL || "",
        });
        setProfile(p);
        setLoadingProfile(false);
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="app" style={{ minHeight: '100vh', background: '#181c21', color: '#fff' }}>
      <nav className="navbar" style={{ background: '#1A1A1A', position: "sticky", top: 0 }}>
        <div className="container" style={{ maxWidth: 940 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: '#e87a41' }}>*</span> KAVIA AI
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a
                href="https://fullcalendar.io/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#31d3b8',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'none',
                  fontWeight: 500,
                  letterSpacing: 0.3,
                  fontSize: '1rem'
                }}
                className="btn"
              >
                FullCalendar
              </a>
              {user ? (
                <>
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="btn"
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "1.5px solid #31d3b8",
                      marginLeft: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontWeight: 500,
                      padding: "7px 14px"
                    }}
                  >
                    {profile && profile.photoURL
                      ? <img src={profile.photoURL} alt="Profile" style={{ width: 30, height: 30, borderRadius: "50%" }} />
                      : <span style={{ background: "#e87a41", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>
                          {profile && profile.name ? profile.name[0].toUpperCase() : user.email[0].toUpperCase()}
                        </span>
                    }
                    <span>{profile?.name || user.displayName || user.email}</span>
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      marginLeft: 6,
                      border: "none",
                      fontWeight: 500,
                      padding: "7px 14px",
                    }}
                    onClick={() => fbSignOut(auth)}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  className="btn"
                  style={{
                    background: "#e87a41",
                    color: "#fff",
                    fontWeight: 500,
                    marginLeft: 18,
                  }}
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        {user && profile && !loadingProfile ? (
          <ColorCategorizedEventScheduler user={user} profile={profile} />
        ) : !user ? (
          // Optional: landing/welcome message
          <div style={{ textAlign: "center", padding: "140px 0", color: "#e87a41", fontWeight: 500, fontSize: 22 }}>
            Please <button style={{ color: "#31d3b8", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setAuthModalOpen(true)}>sign in</button> to access your Color-Categorized Event Scheduler.
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "140px 0", color: "#31d3b8", fontWeight: 500, fontSize: 20 }}>
            Loading your profile...
          </div>
        )}
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        {user && (
          <UserProfileModal
            open={profileModalOpen}
            uid={user.uid}
            onClose={() => setProfileModalOpen(false)}
            onProfileUpdated={setProfile}
          />
        )}
      </main>
    </div>
  );
}

export default App;