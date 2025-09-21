import React, { useState } from 'react';
import Preview from './components/Preview-new';
import ErrorPanel from './components/ErrorPanel-new';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showErrorPanel, setShowErrorPanel] = useState(false);

  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedCode(result);
        setErrors([]); // Clear any previous errors

        const aiMessage = {
          type: 'ai',
          content: `Generated ${result.components?.length || 0} component(s) successfully!`,
          components: result.components,
          timestamp: new Date().toLocaleTimeString()
        };

        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        const errorObj = {
          id: Date.now(),
          type: 'GENERATION_ERROR',
          message: result.message || 'Failed to generate code',
          componentName: 'CodeGenerator',
          severity: 'high',
          timestamp: new Date().toISOString()
        };

        setErrors([errorObj]);
        setShowErrorPanel(true);

        const errorMessage = {
          type: 'error',
          content: result.message || 'Failed to generate code',
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorObj = {
        id: Date.now(),
        type: 'NETWORK_ERROR',
        message: `Connection failed: ${error.message}`,
        componentName: 'API',
        severity: 'high',
        timestamp: new Date().toISOString()
      };

      setErrors([errorObj]);
      setShowErrorPanel(true);

      const errorMessage = {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handlePreviewError = (error) => {
    const errorObj = {
      ...error,
      id: error.id || Date.now(),
    };

    setErrors(prev => {
      const existing = prev.find(e => e.componentName === errorObj.componentName && e.type === errorObj.type);
      if (existing) return prev;
      return [...prev, errorObj];
    });
    setShowErrorPanel(true);
  };

  const handleErrorFixed = (fixResult) => {
    if (fixResult.success) {
      // Remove the fixed error
      setErrors(prev => prev.filter(error =>
        error.componentName !== fixResult.component?.name
      ));

      // Update generated code with fixed version
      setGeneratedCode(prev => ({
        ...prev,
        components: prev?.components?.map(comp =>
          comp.name === fixResult.component?.name ? fixResult.component : comp
        ) || [],
        allComponents: fixResult.allComponents,
        mainApp: fixResult.mainApp
      }));

      // Add success message to chat
      const successMessage = {
        type: 'ai',
        content: `✅ Fixed ${fixResult.component?.name} successfully!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, successMessage]);
    }
  };

  const handlePushToGitHub = async () => {
    if (!repoUrl.trim()) {
      setShowRepoInput(true);
      return;
    }

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          commitMessage: 'AI Generated Code Update'
        })
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert(`Failed to push to GitHub: ${error.message}`);
    }
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <h1 style={styles.title}>🤖 AI Code Generator</h1>
          <span style={styles.subtitle}>Powered by Claude AI</span>
        </div>

        <div style={styles.actions}>
          {showRepoInput && (
            <input
              type="text"
              placeholder="GitHub Repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              style={styles.input}
            />
          )}
          <button
            onClick={handlePushToGitHub}
            style={styles.button}
          >
            🚀 Push to GitHub
          </button>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2>💬 AI Chat</h2>
            <button
              onClick={() => setChatHistory([])}
              style={styles.clearButton}
            >
              🗑️ Clear
            </button>
          </div>

          <div style={styles.chatContainer}>
            {chatHistory.length === 0 ? (
              <div style={styles.welcome}>
                <h3>Welcome! 👋</h3>
                <p>Describe what you want to build and I'll generate React components for you.</p>
                <div style={styles.examples}>
                  <h4>Try these examples:</h4>
                  <button
                    onClick={() => setPrompt("Create a todo list component with add, delete, and toggle functionality")}
                    style={styles.exampleButton}
                  >
                    Create a todo list component
                  </button>
                  <button
                    onClick={() => setPrompt("Build a user profile card with avatar and contact info")}
                    style={styles.exampleButton}
                  >
                    Build a user profile card
                  </button>
                  <button
                    onClick={() => setPrompt("Make a simple calculator")}
                    style={styles.exampleButton}
                  >
                    Make a simple calculator
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.messages}>
                {chatHistory.map((message, index) => (
                  <div key={index} style={getMessageStyle(message.type)}>
                    <div style={styles.messageHeader}>
                      <span style={styles.sender}>
                        {message.type === 'user' ? '👤 You' :
                         message.type === 'ai' ? '🤖 Claude' : '❌ Error'}
                      </span>
                      <span style={styles.timestamp}>{message.timestamp}</span>
                    </div>
                    <div style={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.components && (
                      <div style={styles.components}>
                        <strong>Generated Components:</strong>
                        <ul>
                          {message.components.map((comp, i) => (
                            <li key={i}>
                              <strong>{comp.name}</strong> - {comp.purpose}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSendPrompt} style={styles.form}>
            <div style={styles.inputContainer}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                style={styles.textarea}
                rows={3}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                style={{
                  ...styles.sendButton,
                  backgroundColor: (!prompt.trim() || isLoading) ? '#ccc' : '#4CAF50',
                  cursor: (!prompt.trim() || isLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
            {isLoading && (
              <div style={styles.loading}>
                🤖 Claude is generating your code...
              </div>
            )}
          </form>
        </aside>

        {/* Main Preview Area */}
        <Preview
          generatedCode={generatedCode}
          onError={handlePreviewError}
          isLoading={isLoading}
        />
      </div>

      {/* Error Panel */}
      {showErrorPanel && errors.length > 0 && (
        <ErrorPanel
          errors={errors}
          onErrorFixed={handleErrorFixed}
          onDismiss={() => setShowErrorPanel(false)}
        />
      )}
    </div>
  );
}

const getMessageStyle = (type) => ({
  marginBottom: '15px',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: type === 'user' ? '#e3f2fd' :
                  type === 'ai' ? '#f1f8e9' : '#ffebee',
  border: `1px solid ${type === 'user' ? '#2196F3' :
                      type === 'ai' ? '#4CAF50' : '#f44336'}`,
});

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    backgroundColor: '#f5f5f5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '200px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '400px',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  chatContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  welcome: {
    padding: '20px',
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  examples: {
    marginTop: '20px',
    textAlign: 'left',
  },
  exampleButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196F3',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'left',
    color: '#1976D2',
  },
  messages: {
    height: '100%',
    overflowY: 'auto',
    padding: '10px',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sender: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#666',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.4',
  },
  components: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  form: {
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'none',
    fontFamily: 'inherit',
  },
  sendButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    minWidth: '44px',
    height: '44px',
  },
  loading: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
  },
  preview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  refreshButton: {
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  previewContent: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#666',
  },
  features: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
  },
  codeDisplay: {
    height: '100%',
  },
  componentBlock: {
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  code: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    fontSize: '12px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    lineHeight: '1.5',
    margin: 0,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
};

export default App;