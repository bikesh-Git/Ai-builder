import React from 'react';
import GeneratedApp from './GeneratedApp';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>
          🤖 AI Generated React Application
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '10px 0 0 0' }}>
          Generated from: "create portfolio"
        </p>
      </div>

        <GeneratedApp />
    </div>
  );
}

export default App;