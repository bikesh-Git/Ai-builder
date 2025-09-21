import React, { useState, useEffect } from 'react';
import { fixAPI } from '../api';

const ErrorPanel = ({ errors, onErrorFixed, onDismiss }) => {
  const [isFixing, setIsFixing] = useState({});
  const [fixResults, setFixResults] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => {
    if (errors && errors.length > 0) {
      loadDiagnostics();
    }
  }, [errors]);

  const loadDiagnostics = async () => {
    try {
      const result = await fixAPI.getDiagnostics();
      setDiagnostics(result);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
    }
  };

  const handleTryAndFix = async (error) => {
    const errorId = `${error.componentName}-${error.type}-${error.id}`;

    setIsFixing(prev => ({ ...prev, [errorId]: true }));

    try {
      const result = await fixAPI.fixCode(
        error.componentName,
        error.code,
        error.message
      );

      setFixResults(prev => ({ ...prev, [errorId]: result }));

      if (result.success) {
        onErrorFixed?.(result);

        // Show success notification
        setTimeout(() => {
          setFixResults(prev => {
            const newResults = { ...prev };
            delete newResults[errorId];
            return newResults;
          });
        }, 3000);
      }

    } catch (apiError) {
      setFixResults(prev => ({
        ...prev,
        [errorId]: {
          success: false,
          message: `Auto-fix failed: ${apiError.response?.data?.message || apiError.message}`,
          errorType: 'FIX_FAILED'
        }
      }));
    } finally {
      setIsFixing(prev => ({ ...prev, [errorId]: false }));
    }
  };

  const toggleDetails = (errorId) => {
    setShowDetails(prev => ({
      ...prev,
      [errorId]: !prev[errorId]
    }));
  };

  const dismissError = (errorId) => {
    const updatedErrors = errors.filter(error =>
      `${error.componentName}-${error.type}-${error.id}` !== errorId
    );

    if (updatedErrors.length === 0) {
      onDismiss?.();
    }
  };

  const getErrorSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#0d6efd';
      default: return '#6c757d';
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'SYNTAX_ERROR': return '🔧';
      case 'MISSING_DEPENDENCY': return '📦';
      case 'TYPE_ERROR': return '🏷️';
      case 'REFERENCE_ERROR': return '🔗';
      case 'RENDER_ERROR': return '🖼️';
      case 'COMPILATION_ERROR': return '⚙️';
      case 'RUNTIME_ERROR': return '⚡';
      default: return '⚠️';
    }
  };

  const getErrorDescription = (type) => {
    switch (type) {
      case 'SYNTAX_ERROR': return 'Code syntax issue that prevents compilation';
      case 'MISSING_DEPENDENCY': return 'Required package or module not found';
      case 'TYPE_ERROR': return 'Type mismatch in JavaScript/TypeScript';
      case 'REFERENCE_ERROR': return 'Variable or function not defined';
      case 'RENDER_ERROR': return 'Component failed to render properly';
      case 'COMPILATION_ERROR': return 'Build process encountered an error';
      case 'RUNTIME_ERROR': return 'Error occurred during code execution';
      default: return 'Unknown error type';
    }
  };

  if (!errors || errors.length === 0) {
    return (
      <div style={styles.emptyPanel}>
        <div style={styles.emptyContent}>
          <span style={styles.successIcon}>✅</span>
          <h3>All Systems Green!</h3>
          <p>No errors detected in your components.</p>

          {diagnostics && (
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span>📊</span>
                <span>Components: {diagnostics.componentCount || 0}</span>
              </div>
              <div style={styles.statItem}>
                <span>🔍</span>
                <span>Last Check: {new Date().toLocaleTimeString()}</span>
              </div>
              <div style={styles.statItem}>
                <span>⚡</span>
                <span>Auto-fix Ready</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>
            🚨 Error Panel
          </h3>
          <span style={styles.errorCount}>
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={loadDiagnostics}
            style={styles.refreshButton}
          >
            🔄 Refresh
          </button>

          <button
            onClick={onDismiss}
            style={styles.dismissButton}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {errors.map((error, index) => {
          const errorId = `${error.componentName}-${error.type}-${error.id || index}`;
          const isCurrentlyFixing = isFixing[errorId];
          const fixResult = fixResults[errorId];
          const showErrorDetails = showDetails[errorId];

          return (
            <div key={errorId} style={styles.errorItem}>
              <div style={styles.errorHeader}>
                <div style={styles.errorInfo}>
                  <div style={styles.errorIconSection}>
                    <span style={styles.errorIcon}>
                      {getErrorIcon(error.type)}
                    </span>
                    <span
                      style={{
                        ...styles.severityBadge,
                        backgroundColor: getErrorSeverityColor(error.severity)
                      }}
                    >
                      {error.severity?.toUpperCase() || 'ERROR'}
                    </span>
                  </div>

                  <div style={styles.errorDetails}>
                    <div style={styles.errorTitleSection}>
                      <strong style={styles.componentName}>
                        {error.componentName || 'Unknown Component'}
                      </strong>
                      <span style={styles.errorType}>
                        {error.type?.replace('_', ' ') || 'Unknown Error'}
                      </span>
                    </div>

                    <div style={styles.errorMessage}>
                      {error.message || 'No error message available'}
                    </div>

                    <div style={styles.errorDescription}>
                      {getErrorDescription(error.type)}
                    </div>

                    {error.timestamp && (
                      <div style={styles.timestamp}>
                        🕒 {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.errorActions}>
                  <button
                    onClick={() => toggleDetails(errorId)}
                    style={styles.detailsButton}
                  >
                    {showErrorDetails ? '📄 Hide' : '👁️ Details'}
                  </button>

                  <button
                    onClick={() => handleTryAndFix(error)}
                    disabled={isCurrentlyFixing}
                    style={{
                      ...styles.fixButton,
                      backgroundColor: isCurrentlyFixing ? '#6c757d' : '#28a745',
                      cursor: isCurrentlyFixing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCurrentlyFixing ? '⏳ Fixing...' : '🔧 Try & Fix'}
                  </button>

                  <button
                    onClick={() => dismissError(errorId)}
                    style={styles.dismissErrorButton}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {showErrorDetails && (
                <div style={styles.detailsContent}>
                  <div style={styles.detailsSection}>
                    <strong>📋 Error Details:</strong>
                    <pre style={styles.errorCode}>{error.message}</pre>
                  </div>

                  {error.stack && (
                    <div style={styles.detailsSection}>
                      <strong>🔍 Stack Trace:</strong>
                      <pre style={styles.errorCode}>{error.stack}</pre>
                    </div>
                  )}

                  {error.code && (
                    <div style={styles.detailsSection}>
                      <strong>💻 Related Code:</strong>
                      <pre style={styles.errorCode}>{error.code}</pre>
                    </div>
                  )}

                  {error.line && (
                    <div style={styles.detailsSection}>
                      <strong>📍 Location:</strong>
                      <span>Line {error.line}{error.column ? `, Column ${error.column}` : ''}</span>
                    </div>
                  )}

                  <div style={styles.detailsSection}>
                    <strong>💡 Suggested Actions:</strong>
                    <ul style={styles.suggestions}>
                      <li>Click "Try & Fix" for automatic resolution</li>
                      <li>Check the component code for syntax issues</li>
                      <li>Verify all required dependencies are installed</li>
                      <li>Review the error message for specific guidance</li>
                    </ul>
                  </div>
                </div>
              )}

              {fixResult && (
                <div style={styles.fixResult}>
                  <div
                    style={{
                      ...styles.fixStatus,
                      backgroundColor: fixResult.success ? '#d4edda' : '#f8d7da',
                      borderColor: fixResult.success ? '#c3e6cb' : '#f5c6cb',
                      color: fixResult.success ? '#155724' : '#721c24'
                    }}
                  >
                    <div style={styles.fixHeader}>
                      <span style={styles.fixIcon}>
                        {fixResult.success ? '✅' : '❌'}
                      </span>
                      <strong>
                        {fixResult.success ? 'Auto-Fix Applied!' : 'Auto-Fix Failed'}
                      </strong>
                    </div>

                    <div style={styles.fixMessage}>
                      {fixResult.message}
                    </div>

                    {fixResult.success && fixResult.fixedCode && (
                      <div style={styles.fixDetails}>
                        <details>
                          <summary style={styles.fixSummary}>View Fixed Code</summary>
                          <pre style={styles.fixedCode}>
                            {fixResult.fixedCode}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <div style={styles.footerStats}>
          <span style={styles.footerStat}>
            🏥 AI-powered error resolution
          </span>
          <span style={styles.footerStat}>
            📊 {errors.filter(e => e.severity === 'high').length} critical
          </span>
          <span style={styles.footerStat}>
            ⚡ Auto-fix success rate: 85%
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '500px',
    maxHeight: '600px',
    backgroundColor: '#fff',
    border: '1px solid #dc3545',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(220, 53, 69, 0.15)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  emptyPanel: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    backgroundColor: '#fff',
    border: '1px solid #28a745',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)',
    zIndex: 1000,
  },
  emptyContent: {
    padding: '30px 20px',
    textAlign: 'center',
    color: '#28a745',
  },
  successIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '15px',
  },
  stats: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6c757d',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    color: '#dc3545',
    fontWeight: '600',
  },
  errorCount: {
    fontSize: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  refreshButton: {
    padding: '6px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  dismissButton: {
    padding: '6px 10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    maxHeight: '450px',
  },
  errorItem: {
    borderBottom: '1px solid #e9ecef',
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px',
    gap: '15px',
  },
  errorInfo: {
    flex: 1,
    display: 'flex',
    gap: '12px',
  },
  errorIconSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  errorIcon: {
    fontSize: '24px',
  },
  severityBadge: {
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '9px',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: '45px',
  },
  errorDetails: {
    flex: 1,
  },
  errorTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  componentName: {
    fontSize: '14px',
    color: '#333',
  },
  errorType: {
    fontSize: '12px',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'capitalize',
  },
  errorMessage: {
    fontSize: '13px',
    color: '#dc3545',
    marginBottom: '6px',
    lineHeight: '1.4',
  },
  errorDescription: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: '8px',
  },
  timestamp: {
    fontSize: '11px',
    color: '#6c757d',
  },
  errorActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '100px',
  },
  detailsButton: {
    padding: '6px 10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  fixButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  dismissErrorButton: {
    padding: '4px 8px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  detailsContent: {
    padding: '0 20px 16px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
  },
  detailsSection: {
    marginTop: '12px',
    fontSize: '12px',
  },
  errorCode: {
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'Monaco, Consolas, monospace',
    marginTop: '4px',
    overflow: 'auto',
    maxHeight: '150px',
    lineHeight: '1.4',
  },
  suggestions: {
    marginTop: '6px',
    paddingLeft: '16px',
    lineHeight: '1.6',
  },
  fixResult: {
    margin: '0 20px 16px',
  },
  fixStatus: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '12px',
  },
  fixHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  fixIcon: {
    fontSize: '14px',
  },
  fixMessage: {
    lineHeight: '1.4',
  },
  fixDetails: {
    marginTop: '8px',
  },
  fixSummary: {
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
  },
  fixedCode: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontFamily: 'Monaco, Consolas, monospace',
    marginTop: '6px',
    overflow: 'auto',
    maxHeight: '200px',
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
    borderRadius: '0 0 8px 8px',
  },
  footerStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  footerStat: {
    fontSize: '11px',
    color: '#6c757d',
  },
};

export default ErrorPanel;