import React from 'react';
import './DockerStatus.css';

interface DockerStatusProps {
  status: { available: boolean; error?: string; version?: string } | null;
  isChecking: boolean;
  onRefresh: () => void;
}

const DockerStatus: React.FC<DockerStatusProps> = ({ status, isChecking, onRefresh }) => {
  const getStatusType = (): 'ok' | 'not-installed' | 'not-running' | 'checking' => {
    if (isChecking) return 'checking';
    if (!status) return 'not-installed';
    if (status.available) return 'ok';
    if (status.error?.includes('not running')) return 'not-running';
    return 'not-installed';
  };

  const statusType = getStatusType();

  const handleRefresh = () => {
    console.log('[DockerStatus] Refresh button clicked, isChecking:', isChecking);
    if (!isChecking && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className={`docker-status status-${statusType}`}>
      <div className="status-header">
        <h3>Docker Status</h3>
        <button onClick={handleRefresh} className="refresh-btn" disabled={isChecking}>
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      <div className="status-content">
        {statusType === 'checking' && (
          <div className="status-message">
            <div className="spinner"></div>
            <span>Checking Docker availability...</span>
          </div>
        )}
        {statusType === 'ok' && (
          <div className="status-message">
            <div className="status-icon success">✓</div>
            <div className="status-details">
              <span className="status-text">Docker Desktop is running</span>
              {status.version && (
                <span className="status-version">{status.version}</span>
              )}
            </div>
          </div>
        )}
        {statusType === 'not-running' && (
          <div className="status-message">
            <div className="status-icon warning">⚠</div>
            <div className="status-details">
              <span className="status-text">Docker Desktop is not running</span>
              <span className="status-help">Please start Docker Desktop and try again</span>
            </div>
          </div>
        )}
        {statusType === 'not-installed' && (
          <div className="status-message">
            <div className="status-icon error">✗</div>
            <div className="status-details">
              <span className="status-text">Docker Desktop is not installed</span>
              <span className="status-help">
                {status?.error || 'Please install Docker Desktop to continue'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DockerStatus;
