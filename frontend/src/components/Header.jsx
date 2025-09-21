import React, { useState } from 'react';
import { githubAPI } from '../api';

const Header = ({ onGitHubResult }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('AI Generated Code Update');
  const [isLoading, setIsLoading] = useState(false);
  const [showRepoInput, setShowRepoInput] = useState(false);

  const handlePushToGitHub = async () => {
    if (!repoUrl.trim()) {
      setShowRepoInput(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await githubAPI.pushToGitHub(repoUrl, commitMessage);
      onGitHubResult(result);
    } catch (error) {
      onGitHubResult({
        success: false,
        message: 'Failed to push to GitHub: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header style={headerStyle}>
      <div style={logoStyle}>
        <h1 style={titleStyle}>🤖 AI Code Generator</h1>
        <span style={subtitleStyle}>Powered by Claude AI</span>
      </div>

      <div style={actionsStyle}>
        {showRepoInput && (
          <div style={repoInputContainerStyle}>
            <input
              type="text"
              placeholder="GitHub Repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        <button
          onClick={handlePushToGitHub}
          disabled={isLoading}
          style={{
            ...buttonStyle,
            backgroundColor: isLoading ? '#ccc' : '#2196F3',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ Pushing...' : '🚀 Push to GitHub'}
        </button>
      </div>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 30px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const logoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  margin: 0,
};

const subtitleStyle = {
  fontSize: '12px',
  color: '#666',
  marginTop: '2px',
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const repoInputContainerStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
};

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  minWidth: '200px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

export default Header;