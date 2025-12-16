import React, { useState, useEffect } from 'react';
import './ResultsViewer.css';

interface ResultsViewerProps {
  results: {
    json?: string;
    pdf?: string;
    log?: string;
    errors?: string[];
  };
  outputPath?: string;
  onNewScan: () => void;
}

interface ResultSummary {
  totalIssues?: number;
  criticalIssues?: number;
  warnings?: number;
  scannedFiles?: number;
  scanDuration?: string;
  [key: string]: unknown;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ results, outputPath, onNewScan }) => {
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'json' | 'log' | 'errors'>('summary');

  useEffect(() => {
    // Parse result.json to extract summary (MistSeeker format)
    if (results.json) {
      try {
        const data = JSON.parse(results.json);
        // MistSeeker report format: { mode, summary: { file_count, problem_file_count, scores }, files: [...] }
        const summaryData = data.summary || {};
        const files = data.files || [];
        
        // Count total issues from files
        let totalIssues = 0;
        files.forEach((file: { issues_raw?: unknown[]; segments?: unknown[] }) => {
          if (file.issues_raw) totalIssues += file.issues_raw.length;
          if (file.segments) totalIssues += file.segments.length;
        });
        
        setSummary({
          mode: data.mode || 'FREE',
          fileCount: summaryData.file_count || files.length || 0,
          problemFileCount: summaryData.problem_file_count || files.filter((f: { problem?: boolean }) => f.problem).length || 0,
          totalIssues: totalIssues,
          scannedFiles: summaryData.file_count || files.length || 0,
          scores: summaryData.scores || {},
          avgCoi: summaryData.avg_coi,
          avgOri: summaryData.avg_ori,
          avgGss: summaryData.avg_gss,
          ...data, // Include all data for full view
        });
      } catch (error) {
        console.error('Failed to parse result.json:', error);
        setSummary(null);
      }
    }
  }, [results.json]);

  const handleOpenPDF = async () => {
    if (results.pdf && window.electronAPI.openFile) {
      await window.electronAPI.openFile(results.pdf);
    }
  };

  const handleOpenFolder = async () => {
    if (outputPath && window.electronAPI.openFolder) {
      await window.electronAPI.openFolder(outputPath);
    } else if (results.pdf) {
      // Fallback: open folder containing PDF
      const pdfPath = results.pdf;
      const folderPath = pdfPath.substring(0, pdfPath.lastIndexOf('/'));
      if (window.electronAPI.openFolder) {
        await window.electronAPI.openFolder(folderPath);
      }
    }
  };

  const handleCreateZIP = async () => {
    if (outputPath && window.electronAPI.createZip) {
      try {
        const zipPath = await window.electronAPI.createZip(outputPath);
        if (zipPath) {
          alert(`ZIP file created: ${zipPath}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Failed to create ZIP: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="results-viewer">
      <div className="results-header">
        <div className="results-title">
          <h2>Scan Results</h2>
          <button onClick={onNewScan} className="new-scan-btn">
            New Scan
          </button>
        </div>
        <div className="results-actions">
          {results.pdf && (
            <button onClick={handleOpenPDF} className="action-btn pdf-btn">
              📄 Open PDF Report
            </button>
          )}
          {outputPath && (
            <>
              <button onClick={handleOpenFolder} className="action-btn folder-btn">
                📂 Open Output Folder
              </button>
              <button onClick={handleCreateZIP} className="action-btn zip-btn">
                📦 Create ZIP for Sharing
              </button>
            </>
          )}
        </div>
      </div>

      <div className="results-tabs">
        <button
          className={activeTab === 'summary' ? 'active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        {results.json && (
          <button
            className={activeTab === 'json' ? 'active' : ''}
            onClick={() => setActiveTab('json')}
          >
            Full JSON
          </button>
        )}
        {results.log && (
          <button
            className={activeTab === 'log' ? 'active' : ''}
            onClick={() => setActiveTab('log')}
          >
            Run Log
          </button>
        )}
        {results.errors && results.errors.length > 0 && (
          <button
            className={activeTab === 'errors' ? 'active' : ''}
            onClick={() => setActiveTab('errors')}
          >
            Errors ({results.errors.length})
          </button>
        )}
      </div>

      <div className="results-content">
        {activeTab === 'summary' && (
          <div className="summary-view">
            {summary ? (
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Mode</div>
                  <div className="summary-value">{summary.mode || 'FREE'}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Files Analyzed</div>
                  <div className="summary-value">{summary.fileCount || summary.scannedFiles || 0}</div>
                </div>
                <div className="summary-card critical">
                  <div className="summary-label">Problem Files</div>
                  <div className="summary-value">{summary.problemFileCount || 0}</div>
                </div>
                <div className="summary-card warning">
                  <div className="summary-label">Total Issues</div>
                  <div className="summary-value">{summary.totalIssues || 0}</div>
                </div>
                {summary.scores?.gsi && (
                  <div className="summary-card">
                    <div className="summary-label">GSI Score</div>
                    <div className="summary-value">{summary.scores.gsi.score_100?.toFixed(1) || 'N/A'} ({summary.scores.gsi.grade || 'N/A'})</div>
                  </div>
                )}
                {summary.scores?.coi && (
                  <div className="summary-card">
                    <div className="summary-label">COI Score</div>
                    <div className="summary-value">{summary.scores.coi.score_100?.toFixed(1) || 'N/A'} ({summary.scores.coi.grade || 'N/A'})</div>
                  </div>
                )}
                {summary.scores?.ori && (
                  <div className="summary-card">
                    <div className="summary-label">ORI Score</div>
                    <div className="summary-value">{summary.scores.ori.score_100?.toFixed(1) || 'N/A'} ({summary.scores.ori.grade || 'N/A'})</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-summary">
                <p>No summary data available. Check the Full JSON tab for details.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && results.json && (
          <div className="json-viewer">
            <pre>{JSON.stringify(JSON.parse(results.json), null, 2)}</pre>
          </div>
        )}

        {activeTab === 'log' && results.log && (
          <div className="log-viewer">
            <pre>{results.log}</pre>
          </div>
        )}

        {activeTab === 'errors' && results.errors && (
          <div className="errors-viewer">
            {results.errors.map((error, index) => (
              <div key={index} className="error-item">
                <span className="error-icon">⚠</span>
                <span className="error-text">{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsViewer;
