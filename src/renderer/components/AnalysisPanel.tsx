import React, { useState, useEffect, useRef } from 'react';
import './AnalysisPanel.css';

interface AnalysisPanelProps {
  analysisId: string;
  onStop: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysisId, onStop }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [progress, setProgress] = useState<string>('Initializing...');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial logs
    const loadLogs = async () => {
      try {
        const currentLogs = await window.electronAPI.getAnalysisLogs(analysisId);
        setLogs(currentLogs);
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    };

    loadLogs();

    // Set up real-time log listener
    const handleLog = (id: string, log: string) => {
      if (id === analysisId) {
        setLogs((prev) => [...prev, log]);
        // Update progress from log content
        if (log.includes('Analysis completed')) {
          setProgress('Completed');
        } else if (log.includes('Analysis in progress')) {
          setProgress('Running...');
        } else if (log.includes('Starting')) {
          setProgress('Starting...');
        }
      }
    };

    window.electronAPI.onAnalysisLog(handleLog);

    return () => {
      window.electronAPI.removeAllListeners('analysis-log');
    };
  }, [analysisId]);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h2>Scan in Progress</h2>
          <div className="progress-indicator">
            <div className="progress-spinner"></div>
            <span className="progress-text">{progress}</span>
          </div>
        </div>
        <div className="panel-actions">
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <button onClick={onStop} className="stop-btn">
            Stop Scan
          </button>
        </div>
      </div>
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">
            <div className="loading-spinner"></div>
            <p>Waiting for logs...</p>
          </div>
        ) : (
          <div className="logs-content">
            {logs.map((log, index) => (
              <div key={index} className="log-line">
                <span className="log-time">{new Date().toLocaleTimeString()}</span>
                <span className="log-text">{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
