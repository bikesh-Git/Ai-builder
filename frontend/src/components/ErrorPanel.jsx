import React, { useState, useEffect } from 'react';
import { fixAPI } from '../api';

const ErrorPanel = ({ errors, onErrorFixed, onDismiss }) => {
  const [isFixing, setIsFixing] = useState({});
  const [fixResults, setFixResults] = useState({});
  const [diagnostics, setDiagnostics] = useState(null);
  const [showDetails, setShowDetails] = useState({});

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

  const handleAutoFix = async (error) => {
    const errorId = `${error.componentName}-${error.type}`;

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
      }

    } catch (apiError) {
      setFixResults(prev => ({
        ...prev,
        [errorId]: {
          success: false,
          message: `Fix failed: ${apiError.message}`
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

  const getErrorSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#2196F3';
      default: return '#666';
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'SYNTAX_ERROR': return '🔧';
      case 'MISSING_DEPENDENCY': return '📦';
      case 'TYPE_ERROR': return '🏷️';
      case 'REFERENCE_ERROR': return '🔗';
      case 'RENDER_ERROR': return '🖼️';
      default: return '⚠️';
    }
  };

  if (!errors || errors.length === 0) {
    return (
      <div style={emptyPanelStyle}>
        <div style={emptyContentStyle}>
          <span style={successIconStyle}>✅</span>
          <h3>No Errors Detected</h3>
          <p>Your code is looking good!</p>

          {diagnostics && (
            <div style={statsStyle}>
              <div>📊 Components: {diagnostics.componentCount || 0}</div>
              <div>🔍 Last Check: {new Date().toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          🚨 Error Panel ({errors.length})
        </h3>

        <div style={headerActionsStyle}>
          <button
            onClick={loadDiagnostics}
            style={refreshButtonStyle}
          >
            🔄 Refresh
          </button>

          <button
            onClick={onDismiss}
            style={dismissButtonStyle}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={contentStyle}>
        {errors.map((error, index) => {
          const errorId = `${error.componentName}-${error.type}-${index}`;
          const isCurrentlyFixing = isFixing[errorId];
          const fixResult = fixResults[errorId];
          const showErrorDetails = showDetails[errorId];

          return (
            <div key={errorId} style={errorItemStyle}>
              <div style={errorHeaderStyle}>
                <div style={errorInfoStyle}>
                  <span style={errorIconStyle}>
                    {getErrorIcon(error.type)}
                  </span>

                  <div style={errorDetailsStyle}>
                    <div style={errorTitleStyle}>
                      <strong>{error.componentName}</strong>
                      <span
                        style={{
                          ...severityBadgeStyle,
                          backgroundColor: getErrorSeverityColor(error.severity)
                        }}
                      >
                        {error.severity}
                      </span>
                    </div>

                    <div style={errorMessageStyle}>
                      {error.type.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                </div>

                <div style={errorActionsStyle}>
                  <button
                    onClick={() => toggleDetails(errorId)}
                    style={detailsButtonStyle}
                  >
                    {showErrorDetails ? '📄 Hide' : '👁️ Details'}
                  </button>

                  <button
                    onClick={() => handleAutoFix(error)}
                    disabled={isCurrentlyFixing}
                    style={{
                      ...fixButtonStyle,
                      backgroundColor: isCurrentlyFixing ? '#ccc' : '#4CAF50',
                      cursor: isCurrentlyFixing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCurrentlyFixing ? '⏳ Fixing...' : '🔧 Try & Fix'}
                  </button>
                </div>
              </div>

              {showErrorDetails && (
                <div style={detailsContentStyle}>
                  <div style={detailsSectionStyle}>
                    <strong>Error Message:</strong>
                    <pre style={errorCodeStyle}>{error.message}</pre>
                  </div>

                  {error.stack && (
                    <div style={detailsSectionStyle}>
                      <strong>Stack Trace:</strong>
                      <pre style={errorCodeStyle}>{error.stack}</pre>
                    </div>
                  )}

                  {error.line && (
                    <div style={detailsSectionStyle}>
                      <strong>Location:</strong>
                      <span>Line {error.line}, Column {error.column}</span>
                    </div>
                  )}
                </div>
              )}

              {fixResult && (
                <div style={fixResultStyle}>
                  <div
                    style={{
                      ...fixStatusStyle,
                      backgroundColor: fixResult.success ? '#e8f5e8' : '#ffeaea',
                      borderColor: fixResult.success ? '#4CAF50' : '#f44336'
                    }}
                  >
                    <span style={fixIconStyle}>
                      {fixResult.success ? '✅' : '❌'}
                    </span>
                    <span>{fixResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={footerStyle}>
        <div style={footerStatsStyle}>
          <span>🏥 Auto-fix available for most errors</span>
          <span>📊 {errors.filter(e => e.severity === 'high').length} critical</span>
        </div>
      </div>
    </div>
  );
};

const panelStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '450px',
  maxHeight: '500px',
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
};

const emptyPanelStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '300px',
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1000,
};

const emptyContentStyle = {
  padding: '20px',
  textAlign: 'center',
  color: '#666',
};

const successIconStyle = {
  fontSize: '32px',
  display: 'block',
  marginBottom: '10px',
};

const statsStyle = {
  marginTop: '15px',
  fontSize: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#f8f9fa',
};

const titleStyle = {
  margin: 0,
  fontSize: '16px',
  color: '#333',
};

const headerActionsStyle = {
  display: 'flex',
  gap: '8px',
};

const refreshButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};

const dismissButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};

const contentStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '10px',
};

const errorItemStyle = {
  marginBottom: '12px',
  border: '1px solid #ffcccb',
  borderRadius: '6px',
  backgroundColor: '#fff5f5',
};

const errorHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
};

const errorInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1,
};

const errorIconStyle = {
  fontSize: '20px',
};

const errorDetailsStyle = {
  flex: 1,
};

const errorTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  marginBottom: '4px',
};

const severityBadgeStyle = {
  padding: '2px 6px',
  borderRadius: '10px',
  fontSize: '10px',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'uppercase',
};

const errorMessageStyle = {
  fontSize: '12px',
  color: '#666',
  textTransform: 'capitalize',
};

const errorActionsStyle = {
  display: 'flex',
  gap: '6px',
};

const detailsButtonStyle = {
  padding: '6px 10px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};

const fixButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};

const detailsContentStyle = {
  padding: '0 12px 12px',
  borderTop: '1px solid #ffcccb',
  backgroundColor: '#fffafa',
};

const detailsSectionStyle = {
  marginTop: '8px',
  fontSize: '12px',
};

const errorCodeStyle = {
  backgroundColor: '#f5f5f5',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'monospace',
  marginTop: '4px',
  overflow: 'auto',
  maxHeight: '100px',
};

const fixResultStyle = {
  margin: '8px 12px 12px',
};

const fixStatusStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const fixIconStyle = {
  fontSize: '14px',
};

const footerStyle = {
  padding: '10px 20px',
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#f8f9fa',
};

const footerStatsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '11px',
  color: '#666',
};

export default ErrorPanel;