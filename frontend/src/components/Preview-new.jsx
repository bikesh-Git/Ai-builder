import React, { useState, useEffect, useRef } from 'react';

const Preview = ({ generatedCode, onError, isLoading }) => {
  const [previewKey, setPreviewKey] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [components, setComponents] = useState({});
  const [errors, setErrors] = useState([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (generatedCode) {
      setComponents(generatedCode.allComponents || {});
      // Force iframe refresh when new code is generated
      setPreviewKey(prev => prev + 1);
      setErrors([]);
    }
  }, [generatedCode]);

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleIframeError = (error) => {
    console.error('Preview iframe error:', error);
    const errorObj = {
      id: Date.now(),
      type: 'RENDER_ERROR',
      message: 'Failed to render preview',
      componentName: 'Preview',
      severity: 'high',
      timestamp: new Date().toISOString()
    };
    setErrors([errorObj]);
    onError?.(errorObj);
  };

  const componentNames = Object.keys(components);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabsSection}>
          <div style={styles.titleSection}>
            <h2 style={styles.title}>📱 Live Preview</h2>
            <span style={styles.componentCount}>
              {componentNames.length} component{componentNames.length !== 1 ? 's' : ''}
            </span>
          </div>

          {componentNames.length > 0 && (
            <div style={styles.componentTabs}>
              {componentNames.map(name => (
                <span key={name} style={styles.componentTag}>
                  🧩 {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={styles.controls}>
          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              ...styles.controlButton,
              backgroundColor: showCode ? '#007bff' : '#f8f9fa',
              color: showCode ? 'white' : '#333'
            }}
          >
            {showCode ? '👁️ Preview' : '💻 Code'}
          </button>

          <button
            onClick={refreshPreview}
            style={styles.controlButton}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}>⏳</div>
            <p>Generating your React app...</p>
            <div style={styles.loadingDetails}>
              <div>🤖 Claude AI is creating components...</div>
              <div>⚡ Setting up live preview...</div>
            </div>
          </div>
        ) : showCode ? (
          <div style={styles.codeView}>
            {componentNames.length > 0 ? (
              <div>
                {componentNames.map(name => (
                  <div key={name} style={styles.codeBlock}>
                    <div style={styles.codeHeader}>
                      <h4>🧩 {name}.jsx</h4>
                      <span style={styles.codeSize}>
                        {components[name]?.length || 0} chars
                      </span>
                    </div>
                    <pre style={styles.code}>
                      <code>{components[name]}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyCode}>
                <h3>📝 No Code Generated</h3>
                <p>Use the chat to generate some React components first!</p>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.previewArea}>
            {componentNames.length > 0 ? (
              <div style={styles.iframeContainer}>
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  src={`http://localhost:3001/preview?t=${Date.now()}`}
                  style={styles.iframe}
                  title="Live React App Preview"
                  onError={handleIframeError}
                  onLoad={() => {
                    console.log('Preview loaded successfully');
                    setErrors([]);
                  }}
                />

                <div style={styles.previewOverlay}>
                  <div style={styles.previewInfo}>
                    <span style={styles.liveIndicator}>🟢 LIVE</span>
                    <span style={styles.previewUrl}>localhost:3001/preview</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚀</div>
                <h3>Ready to Build Amazing React Apps!</h3>
                <p>Use the chat to describe what you want to create.</p>

                <div style={styles.features}>
                  <div style={styles.feature}>
                    <span>✨</span>
                    <div>
                      <strong>AI-Powered Generation</strong>
                      <p>Describe your UI in natural language</p>
                    </div>
                  </div>
                  <div style={styles.feature}>
                    <span>👁️</span>
                    <div>
                      <strong>Live Preview</strong>
                      <p>See your components running instantly</p>
                    </div>
                  </div>
                  <div style={styles.feature}>
                    <span>🔧</span>
                    <div>
                      <strong>Auto-Fix Errors</strong>
                      <p>Intelligent error detection and fixes</p>
                    </div>
                  </div>
                  <div style={styles.feature}>
                    <span>🚀</span>
                    <div>
                      <strong>GitHub Integration</strong>
                      <p>Push your code directly to repositories</p>
                    </div>
                  </div>
                </div>

                <div style={styles.quickStart}>
                  <h4>Quick Start Examples:</h4>
                  <div style={styles.examples}>
                    <code>"Create a todo list with add and delete"</code>
                    <code>"Build a user profile card"</code>
                    <code>"Make a simple calculator"</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div style={styles.errorBanner}>
          <span>⚠️ Preview Error: {errors[0].message}</span>
          <button
            onClick={() => setErrors([])}
            style={styles.dismissError}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  tabsSection: {
    flex: 1,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  componentCount: {
    fontSize: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  componentTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  componentTag: {
    fontSize: '11px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #bbdefb',
  },
  controls: {
    display: 'flex',
    gap: '10px',
  },
  controlButton: {
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  content: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    gap: '15px',
  },
  spinner: {
    fontSize: '48px',
    animation: 'spin 2s linear infinite',
  },
  loadingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
    textAlign: 'center',
    opacity: 0.8,
  },
  previewArea: {
    height: '100%',
    position: 'relative',
  },
  iframeContainer: {
    position: 'relative',
    height: '100%',
    border: '1px solid #e0e0e0',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#fff',
  },
  previewOverlay: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    pointerEvents: 'none',
  },
  previewInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  liveIndicator: {
    fontSize: '10px',
    fontWeight: 'bold',
  },
  previewUrl: {
    opacity: 0.8,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '30px',
    width: '100%',
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textAlign: 'left',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  quickStart: {
    marginTop: '30px',
    width: '100%',
  },
  examples: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px',
  },
  codeView: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: '#f8f9fa',
  },
  emptyCode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
  },
  codeBlock: {
    margin: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  codeSize: {
    fontSize: '11px',
    color: '#666',
  },
  code: {
    padding: '20px',
    fontSize: '13px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    lineHeight: '1.5',
    backgroundColor: '#fff',
    margin: 0,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '400px',
  },
  errorBanner: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  dismissError: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
  },
};

export default Preview;