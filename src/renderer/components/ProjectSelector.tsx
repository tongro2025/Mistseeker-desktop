import React, { useState, useRef, useCallback } from 'react';
import './ProjectSelector.css';

interface ProjectSelectorProps {
  selectedProject: string | null;
  imageName: string;
  onSelectProject: () => void;
  onProjectDropped: (path: string) => void;
  onCodePaste: (code: string) => void;
  onImageNameChange: (name: string) => void;
  onRunScan: () => void;
  dockerAvailable: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  imageName,
  onSelectProject,
  onProjectDropped,
  onCodePaste,
  onImageNameChange,
  onRunScan,
  dockerAvailable,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCodePaste, setShowCodePaste] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer.items);
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          // For Electron, we need to use the file path
          const file = item.getAsFile();
          if (file) {
            // In Electron, we'll need IPC to get the full path
            // For now, trigger folder selection
            onSelectProject();
          }
        }
      }
    }
  }, [onSelectProject]);

  const handleCodePasteSubmit = () => {
    if (pastedCode.trim()) {
      onCodePaste(pastedCode);
      setPastedCode('');
      setShowCodePaste(false);
    }
  };

  return (
    <div className="project-selector">
      <div className="selector-container">
        <h2>Project Selection</h2>
        
        <div className="form-section">
          <label>Docker Image</label>
          <input
            type="text"
            value={imageName}
            onChange={(e) => onImageNameChange(e.target.value)}
            placeholder="mistseeker/mistseeker:latest"
            className="image-input"
          />
        </div>

        <div className="form-section">
          <label>Project Source</label>
          
          {/* Default: Folder Selection */}
          <div className="project-path-section">
            <div className="path-display">
              <span className="path-label">Selected Folder:</span>
              <span className="path-value">
                {selectedProject || 'No folder selected'}
              </span>
            </div>
            <button
              onClick={onSelectProject}
              className="browse-btn"
            >
              Select Folder
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedProject ? 'has-project' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <div className="drop-icon">📁</div>
              <p>Drag & drop a project folder here</p>
              <span className="drop-hint">or click "Select Folder" above</span>
            </div>
          </div>

          {/* Code Paste Option */}
          <div className="code-paste-section">
            {!showCodePaste ? (
              <button
                type="button"
                onClick={() => setShowCodePaste(true)}
                className="code-paste-toggle"
              >
                📋 Paste Code Instead
              </button>
            ) : (
              <div className="code-paste-form">
                <label>Paste your code here:</label>
                <textarea
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="Paste your code here. A temporary project folder will be created."
                  rows={6}
                  className="code-textarea"
                />
                <div className="code-paste-actions">
                  <button
                    onClick={handleCodePasteSubmit}
                    disabled={!pastedCode.trim()}
                    className="paste-submit-btn"
                  >
                    Create Project & Scan
                  </button>
                  <button
                    onClick={() => {
                      setShowCodePaste(false);
                      setPastedCode('');
                    }}
                    className="paste-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="actions-section">
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Run Scan button clicked in ProjectSelector');
              console.log('selectedProject:', selectedProject);
              console.log('dockerAvailable:', dockerAvailable);
              onRunScan();
            }}
            disabled={!selectedProject || !dockerAvailable}
            className="run-scan-btn"
          >
            Run Scan
          </button>
          {!dockerAvailable && (
            <span className="disabled-hint">Docker must be available to run scans</span>
          )}
          {!selectedProject && dockerAvailable && (
            <span className="disabled-hint">Please select a project folder first</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
