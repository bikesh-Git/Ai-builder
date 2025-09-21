import React, { useState } from 'react';

function AppTest() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting:', message);

    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: message })
      });

      const data = await response.json();
      console.log('Response:', data);
      setResponses(prev => [...prev, data]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Code Generator - Test</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your prompt..."
          style={{
            width: '300px',
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>

      <div>
        <h3>Responses:</h3>
        {responses.map((response, index) => (
          <div key={index} style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppTest;