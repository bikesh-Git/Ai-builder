import React, { useState, useRef, useEffect } from 'react';
import { promptAPI } from '../api';

const Sidebar = ({ onCodeGenerated, onLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim() || isGenerating) return;

    const userMessage = {
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsGenerating(true);
    onLoading(true);

    try {
      const result = await promptAPI.sendPrompt(prompt);

      const aiMessage = {
        type: 'ai',
        content: result.message,
        components: result.components,
        timestamp: new Date().toLocaleTimeString(),
        success: result.success
      };

      setChatHistory(prev => [...prev, aiMessage]);

      if (result.success) {
        onCodeGenerated(result);
      }

    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: `Error: ${error.response?.data?.message || error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      onLoading(false);
      setPrompt('');
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const loadExamplePrompts = (example) => {
    setPrompt(example);
  };

  const examplePrompts = [
    "Create a todo list component with add, delete, and toggle functionality",
    "Build a user profile card with avatar, name, and contact info",
    "Make a simple calculator with basic math operations",
    "Create a weather widget with temperature and conditions",
    "Build a image gallery with thumbnails and modal view"
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>💬 AI Chat</h2>
        <button onClick={clearChat} style={clearButtonStyle}>
          🗑️ Clear
        </button>
      </div>

      <div style={chatContainerStyle}>
        {chatHistory.length === 0 ? (
          <div style={welcomeStyle}>
            <h3>Welcome! 👋</h3>
            <p>Describe what you want to build and I'll generate React components for you.</p>

            <div style={examplesStyle}>
              <h4>Try these examples:</h4>
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExamplePrompts(example)}
                  style={exampleButtonStyle}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={messagesStyle}>
            {chatHistory.map((message, index) => (
              <div key={index} style={getMessageStyle(message.type)}>
                <div style={messageHeaderStyle}>
                  <span style={senderStyle}>
                    {message.type === 'user' ? '👤 You' :
                     message.type === 'ai' ? '🤖 Claude' : '❌ Error'}
                  </span>
                  <span style={timestampStyle}>{message.timestamp}</span>
                </div>

                <div style={messageContentStyle}>
                  {message.content}
                </div>

                {message.components && (
                  <div style={componentsStyle}>
                    <strong>Generated Components:</strong>
                    <ul>
                      {message.components.map((comp, i) => (
                        <li key={i} style={componentItemStyle}>
                          <span style={componentNameStyle}>{comp.name}</span>
                          <span style={componentPurposeStyle}>- {comp.purpose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputContainerStyle}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build..."
            style={textareaStyle}
            rows={3}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            style={{
              ...sendButtonStyle,
              backgroundColor: (!prompt.trim() || isGenerating) ? '#ccc' : '#4CAF50',
              cursor: (!prompt.trim() || isGenerating) ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? '⏳' : '🚀'}
          </button>
        </div>

        {isGenerating && (
          <div style={loadingStyle}>
            <span>🤖 Claude is generating your code...</span>
          </div>
        )}
      </form>
    </aside>
  );
};

const sidebarStyle = {
  width: '400px',
  height: '100vh',
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
};

const headerSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderBottom: '1px solid #e0e0e0',
};

const titleStyle = {
  margin: 0,
  fontSize: '18px',
  color: '#333',
};

const clearButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#ff4444',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
};

const chatContainerStyle = {
  flex: 1,
  overflow: 'hidden',
};

const welcomeStyle = {
  padding: '20px',
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const examplesStyle = {
  marginTop: '20px',
  textAlign: 'left',
};

const exampleButtonStyle = {
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
};

const messagesStyle = {
  height: '100%',
  overflowY: 'auto',
  padding: '10px',
};

const getMessageStyle = (type) => ({
  marginBottom: '15px',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: type === 'user' ? '#e3f2fd' :
                  type === 'ai' ? '#f1f8e9' : '#ffebee',
  border: `1px solid ${type === 'user' ? '#2196F3' :
                      type === 'ai' ? '#4CAF50' : '#f44336'}`,
});

const messageHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const senderStyle = {
  fontWeight: 'bold',
  fontSize: '14px',
};

const timestampStyle = {
  fontSize: '12px',
  color: '#666',
};

const messageContentStyle = {
  fontSize: '14px',
  lineHeight: '1.4',
};

const componentsStyle = {
  marginTop: '10px',
  padding: '8px',
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  borderRadius: '4px',
  fontSize: '12px',
};

const componentItemStyle = {
  margin: '4px 0',
};

const componentNameStyle = {
  fontWeight: 'bold',
  color: '#2e7d32',
};

const componentPurposeStyle = {
  color: '#555',
};

const formStyle = {
  padding: '20px',
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#fff',
};

const inputContainerStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-end',
};

const textareaStyle = {
  flex: 1,
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  resize: 'none',
  fontFamily: 'inherit',
};

const sendButtonStyle = {
  padding: '12px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  cursor: 'pointer',
  minWidth: '44px',
  height: '44px',
};

const loadingStyle = {
  marginTop: '10px',
  fontSize: '12px',
  color: '#666',
  fontStyle: 'italic',
};

export default Sidebar;