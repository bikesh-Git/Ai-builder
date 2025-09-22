import React, { useState } from 'react';
import ReactAppGenerator from './components/ReactAppGenerator';

const App = () => {
  const [activeTab, setActiveTab] = useState('generator');
const [showRepoInput, setShowRepoInput] = useState(false);
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
          repoUrl: repoUrl.trim(),
          commitMessage: 'AI Generated Code Update'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.message}`);
        setShowRepoInput(false);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Failed to push to GitHub: ${error.message}`);
    }
  };
  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <h1 style={styles.brandTitle}>🤖 AI React Studio</h1>
          <p style={styles.brandSubtitle}>Generate React Apps with AI</p>
        </div>

        <div style={styles.navTabs}>
          <button
            onClick={() => setActiveTab('generator')}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'generator' ? '#007bff' : 'transparent',
              color: activeTab === 'generator' ? 'white' : '#666'
            }}
          >
            🚀 App Generator
          </button>
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
      </nav>

      <main style={styles.main}>
        {activeTab === 'generator' && <ReactAppGenerator />}
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          🤖 Powered by AI • Generate unlimited React applications •
          <span style={styles.highlight}> Live Preview Enabled</span>
        </p>
      </footer>
    </div>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navBrand: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
    fontWeight: '700',
  },
  brandSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    fontWeight: '400',
  },
  navTabs: {
    display: 'flex',
    gap: '10px',
  },
  tab: {
    background: 'transparent',
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    overflow: 'auto',
  },
  footer: {
    background: 'rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '15px 20px',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  highlight: {
    color: '#ffeb3b',
    fontWeight: '600',
  },
};

export default App;