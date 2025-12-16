import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  onClose?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [reportsPath, setReportsPath] = useState<string>('');
  const [defaultPath, setDefaultPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentPath = await window.electronAPI.getReportsPath();
      const defaultPathValue = await window.electronAPI.getDefaultReportsPath();
      setReportsPath(currentPath);
      setDefaultPath(defaultPathValue);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selectedPath = await window.electronAPI.selectReportsFolder();
      if (selectedPath) {
        setReportsPath(selectedPath);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const handleSave = async () => {
    try {
      await window.electronAPI.setReportsPath(reportsPath);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      alert(`Failed to save settings: ${error}`);
    }
  };

  const handleReset = async () => {
    try {
      await window.electronAPI.resetReportsPath();
      await loadSettings();
    } catch (error) {
      alert(`Failed to reset settings: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-panel">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        )}
      </div>
      
      <div className="settings-content">
        <div className="setting-item">
          <label>Reports Output Directory</label>
          <p className="setting-description">
            Where scan results are saved. Each scan creates a folder with the project name and timestamp.
          </p>
          <div className="path-input-group">
            <input
              type="text"
              value={reportsPath}
              onChange={(e) => setReportsPath(e.target.value)}
              className="path-input"
              placeholder="Select a folder..."
            />
            <button onClick={handleSelectFolder} className="browse-btn">
              Browse
            </button>
          </div>
          <div className="path-actions">
            <button onClick={handleReset} className="reset-btn">
              Reset to Default
            </button>
            <span className="default-path-hint">Default: {defaultPath}</span>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button onClick={handleSave} className="save-btn">
          Save Settings
        </button>
        {onClose && (
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

