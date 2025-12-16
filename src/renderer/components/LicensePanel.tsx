import React, { useState, useEffect } from 'react';
import './LicensePanel.css';

interface LicensePanelProps {
  onRegister: (licenseKey: string) => Promise<{ success: boolean; error?: string }>;
}

const LicensePanel: React.FC<LicensePanelProps> = ({ onRegister }) => {
  const [licenseType, setLicenseType] = useState<'free' | 'pro'>('free');
  const [licenseKey, setLicenseKey] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check license status on mount and when registration completes
  const checkLicenseStatus = async () => {
    console.log('[LicensePanel] checkLicenseStatus called');
    try {
      console.log('[LicensePanel] Calling window.electronAPI.getLicenseStatus()');
      const status = await window.electronAPI.getLicenseStatus();
      console.log('[LicensePanel] License status received:', status);
      setLicenseType(status.type);
    } catch (error) {
      console.error('[LicensePanel] Failed to check license status:', error);
    }
  };

  useEffect(() => {
    checkLicenseStatus();
  }, []);

  const handleRegister = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setIsRegistering(true);
    setError(null);
    
    try {
      const result = await onRegister(licenseKey);
      if (result.success) {
        setLicenseKey('');
        setShowRegisterForm(false);
        // Refresh license status
        await checkLicenseStatus();
      } else {
        setError(result.error || 'Failed to register license');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage || 'Failed to register license');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRefresh = async () => {
    console.log('[LicensePanel] Refresh button clicked, isRegistering:', isRegistering, 'licenseType:', licenseType);
    if (isRegistering) return;

    // If in Pro mode, remove license to go back to Free mode
    if (licenseType === 'pro') {
      if (window.confirm('Cancel license and return to Free mode?')) {
        setIsRegistering(true);
        try {
          console.log('[LicensePanel] Removing license...');
          const result = await window.electronAPI.removeLicense();
          if (result.success) {
            console.log('[LicensePanel] License removed successfully');
            await checkLicenseStatus();
          } else {
            console.error('[LicensePanel] Failed to remove license:', result.error);
            alert(result.error || 'Failed to cancel license.');
          }
        } catch (error: unknown) {
          console.error('[LicensePanel] Error removing license:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          alert(errorMessage || 'An error occurred while canceling license.');
        } finally {
          setIsRegistering(false);
        }
      }
    } else {
      // If in Free mode, just refresh the status
      await checkLicenseStatus();
    }
  };

  return (
    <div className={`license-panel license-${licenseType}`}>
      <div className="license-header">
        <h3>License</h3>
        <button onClick={handleRefresh} className="refresh-btn" disabled={isRegistering}>
          {licenseType === 'pro' ? 'Cancel License' : 'Refresh'}
        </button>
      </div>
      <div className="license-content">
        {licenseType === 'pro' ? (
          <div className="license-info">
            <div className="license-badge pro">PRO MODE</div>
            <p className="license-description">License file found. Pro features enabled.</p>
          </div>
        ) : (
          <div className="license-unregistered">
            <div className="license-badge free">FREE MODE</div>
            <p className="license-description">No license file found. Running in Free mode.</p>
            {!showRegisterForm ? (
              <button
                onClick={() => setShowRegisterForm(true)}
                className="register-btn"
                disabled={isRegistering}
              >
                Register License
              </button>
            ) : (
              <div className="register-form">
                <input
                  type="text"
                  placeholder="Enter license key"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  disabled={isRegistering}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isRegistering) {
                      handleRegister();
                    }
                  }}
                />
                {error && (
                  <div className="register-error">{error}</div>
                )}
                <div className="register-actions">
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || !licenseKey.trim()}
                    className="submit-btn"
                  >
                    {isRegistering ? 'Registering...' : 'Submit'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRegisterForm(false);
                      setLicenseKey('');
                      setError(null);
                    }}
                    disabled={isRegistering}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { LicensePanel };
export default LicensePanel;
