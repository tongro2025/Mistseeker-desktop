import React, { useState } from 'react';
import './Header.css';
import SettingsPanel from './SettingsPanel';
import mistseekerLogo from '../assets/mistseeker.png';

const Header: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            {!imgError ? (
              <img 
                src={mistseekerLogo} 
                alt="MistSeeker" 
                className="header-logo"
                onError={() => {
                  console.error('Failed to load logo image');
                  setImgError(true);
                }}
                onLoad={() => {
                  console.log('Logo image loaded successfully');
                }}
              />
            ) : (
              <div className="header-logo-placeholder">M</div>
            )}
            <div className="header-title-group">
              <h1 className="header-title">MistSeeker</h1>
              <span className="header-subtitle">Desktop</span>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} className="settings-btn">
            <span className="settings-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </header>
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;


