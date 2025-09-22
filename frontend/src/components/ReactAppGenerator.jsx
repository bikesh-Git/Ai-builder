import React, { useState, useEffect } from 'react';

const ReactAppGenerator = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApps, setGeneratedApps] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [error, setError] = useState('');

  // Load existing running apps on component mount
  useEffect(() => {
    loadRunningApps();
  }, []);

  const loadRunningApps = async () => {
    try {
      const response = await fetch('/api/generate/apps');
      const data = await response.json();

      if (data.success) {
        setGeneratedApps(data.apps);
      }
    } catch (error) {
      console.error('Error loading running apps:', error);
    }
  };

  const generateReactApp = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt for your React app');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      console.log('🚀 Generating React app for:', userPrompt);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });

      const data = await response.json();

      if (data.success) {
        const newApp = {
          appId: data.appId,
          url: data.url,
          port: data.port,
          prompt: data.prompt,
          startTime: new Date()
        };

        setGeneratedApps(prev => [newApp, ...prev]);
        setCurrentApp(newApp);
        setUserPrompt('');
        console.log('✅ React app generated successfully:', data.url);
      } else {
        setError(data.message || 'Failed to generate React app');
      }
    } catch (error) {
      console.error('Error generating React app:', error);
      setError('Network error: Failed to generate React app');
    } finally {
      setIsGenerating(false);
    }
  };

  const stopApp = async (appId) => {
    try {
      const response = await fetch(`/api/generate/stop/${appId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedApps(prev => prev.filter(app => app.appId !== appId));
        if (currentApp && currentApp.appId === appId) {
          setCurrentApp(null);
        }
      } else {
        setError(data.message || 'Failed to stop app');
      }
    } catch (error) {
      console.error('Error stopping app:', error);
      setError('Network error: Failed to stop app');
    }
  };

  const selectApp = (app) => {
    setCurrentApp(app);
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🤖 AI React App Generator</h1>
        <p style={styles.subtitle}>
          Generate complete React applications instantly with AI
        </p>


        
      </div>

      <div style={styles.content}>
        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Describe your React app:
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., Create a todo list app with add, delete, and mark complete functionality"
              style={styles.textarea}
              disabled={isGenerating}
            />
          </div>

          <button
            onClick={generateReactApp}
            disabled={isGenerating || !userPrompt.trim()}
            style={{
              ...styles.generateButton,
              opacity: (isGenerating || !userPrompt.trim()) ? 0.6 : 1,
              cursor: (isGenerating || !userPrompt.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? (
              <>
                <span style={styles.spinner}>⏳</span>
                Generating React App...
              </>
            ) : (
              <>
                <span>🚀</span>
                Generate React App
              </>
            )}
          </button>

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Generated Apps List */}
        {generatedApps.length > 0 && (
          <div style={styles.appsSection}>
            <h3 style={styles.sectionTitle}>Generated React Apps</h3>
            <div style={styles.appsList}>
              {generatedApps.map((app) => (
                <div
                  key={app.appId}
                  style={{
                    ...styles.appItem,
                    border: currentApp?.appId === app.appId ? '2px solid #007bff' : '1px solid #e0e0e0'
                  }}
                >
                  <div style={styles.appInfo}>
                    <div style={styles.appPrompt}>"{app.prompt}"</div>
                    <div style={styles.appMeta}>
                      Port: {app.port} • {app.url}
                    </div>
                  </div>
                  <div style={styles.appActions}>
                    <button
                      onClick={() => selectApp(app)}
                      style={styles.selectButton}
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={() => window.open(app.url, '_blank')}
                      style={styles.openButton}
                    >
                      🔗 Open
                    </button>
                    <button
                      onClick={() => stopApp(app.appId)}
                      style={styles.stopButton}
                    >
                      🛑 Stop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Preview */}
        {currentApp && (
          <div style={styles.previewSection}>
            <div style={styles.previewHeader}>
              <h3 style={styles.sectionTitle}>Live Preview</h3>
              <div style={styles.previewMeta}>
                <span style={styles.liveIndicator}>🟢 LIVE</span>
                <span style={styles.previewUrl}>{currentApp.url}</span>
                <button
                  onClick={() => window.open(currentApp.url, '_blank')}
                  style={styles.fullscreenButton}
                >
                  🔗 Open in New Tab
                </button>
              </div>
            </div>

            <div style={styles.iframeContainer}>
              <iframe
                key={currentApp.appId}
                src={currentApp.url}
                style={styles.iframe}
                title={`React App Preview - ${currentApp.appId}`}
                onLoad={() => console.log('Preview loaded:', currentApp.url)}
                onError={() => setError('Failed to load preview')}
              />
            </div>

            <div style={styles.previewFooter}>
              <div style={styles.appDetails}>
                <strong>Prompt:</strong> "{currentApp.prompt}"<br />
                <strong>App ID:</strong> {currentApp.appId}<br />
                <strong>Port:</strong> {currentApp.port}
              </div>
            </div>
          </div>
        )}

        {/* No Apps State */}
        {generatedApps.length === 0 && !isGenerating && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🚀</div>
            <h3>Ready to Generate React Apps!</h3>
            <p>Enter a prompt above to create your first AI-generated React application.</p>

            <div style={styles.examples}>
              <h4>Try these examples:</h4>
              <div style={styles.examplesList}>
                <button
                  onClick={() => setUserPrompt('Create a simple calculator app')}
                  style={styles.exampleButton}
                >
                  Calculator App
                </button>
                <button
                  onClick={() => setUserPrompt('Build a todo list with add, delete, and complete functionality')}
                  style={styles.exampleButton}
                >
                  Todo List App
                </button>
                <button
                  onClick={() => setUserPrompt('Make a weather dashboard with location search')}
                  style={styles.exampleButton}
                >
                  Weather Dashboard
                </button>
                <button
                  onClick={() => setUserPrompt('Create a simple blog with posts and comments')}
                  style={styles.exampleButton}
                >
                  Blog App
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  inputSection: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  generateButton: {
    background: 'linear-gradient(45deg, #007bff, #0056b3)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    transition: 'all 0.2s',
    minWidth: '200px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '15px',
    border: '1px solid #f5c6cb',
  },
  appsSection: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '20px',
    color: '#333',
    padding: '20px 20px 0 20px',
  },
  appsList: {
    padding: '0 20px 20px 20px',
  },
  appItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '10px',
    background: '#fafafa',
  },
  appInfo: {
    flex: 1,
  },
  appPrompt: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
  },
  appMeta: {
    fontSize: '12px',
    color: '#666',
  },
  appActions: {
    display: 'flex',
    gap: '8px',
  },
  selectButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  openButton: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  stopButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  previewSection: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
  },
  previewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  liveIndicator: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  previewUrl: {
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace',
  },
  fullscreenButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  iframeContainer: {
    height: '600px',
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  previewFooter: {
    padding: '15px 20px',
    background: '#f8f9fa',
    borderTop: '1px solid #e0e0e0',
  },
  appDetails: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  examples: {
    marginTop: '30px',
  },
  examplesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '15px',
  },
  exampleButton: {
    background: '#e9ecef',
    border: '1px solid #dee2e6',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
};

export default ReactAppGenerator;