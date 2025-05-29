import React from 'react';
import './App.css';
import ColorCategorizedEventScheduler from './ColorCategorizedEventScheduler';

function App() {
  // PUBLIC_INTERFACE
  return (
    <div className="app" style={{ minHeight: '100vh', background: '#181c21', color: '#fff' }}>
      <nav className="navbar" style={{ background: '#1A1A1A', position: "sticky", top: 0 }}>
        <div className="container" style={{ maxWidth: 940 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: '#e87a41' }}>*</span> KAVIA AI
            </div>
            <a
              href="https://fullcalendar.io/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#31d3b8', background: 'none', border: 'none', textDecoration: 'none', fontWeight: 500, letterSpacing: 0.3, fontSize: '1rem' }}
              className="btn"
            >
              FullCalendar
            </a>
          </div>
        </div>
      </nav>
      <main>
        <ColorCategorizedEventScheduler />
      </main>
    </div>
  );
}

export default App;