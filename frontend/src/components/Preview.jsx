import React, { useState, useEffect, useMemo } from 'react';
import { promptAPI } from '../api';

const Preview = ({ generatedCode, onError, isLoading }) => {
  const [components, setComponents] = useState({});
  const [mainApp, setMainApp] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('App');
  const [showCode, setShowCode] = useState(false);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    if (generatedCode) {
      setComponents(generatedCode.allComponents || {});
      setMainApp(generatedCode.mainApp || '');

      if (generatedCode.components && generatedCode.components.length > 0) {
        setSelectedComponent(generatedCode.components[0].name);
      }
    }
  }, [generatedCode]);

  const loadComponents = async () => {
    try {
      const result = await promptAPI.getComponents();
      if (result.success) {
        setComponents(result.components);
        setMainApp(result.projectStructure?.mainApp || '');
      }
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  };

  const renderPreview = useMemo(() => {
    try {
      setRenderError(null);

      if (!components || Object.keys(components).length === 0) {
        return (
          <div style={emptyStateStyle}>
            <h3>🚀 Ready to Generate Code</h3>
            <p>Use the chat to describe what you want to build!</p>
            <div style={featuresStyle}>
              <div>✨ AI-powered code generation</div>
              <div>🔧 Automatic error fixing</div>
              <div>📱 Live preview</div>
              <div>🚀 GitHub integration</div>
            </div>
          </div>
        );
      }

      if (selectedComponent === 'App' && mainApp) {
        return (
          <div style={previewContentStyle}>
            <iframe
              srcDoc={generateHTMLPreview(mainApp, components)}
              style={iframeStyle}
              title="App Preview"
              onError={(e) => {
                setRenderError('Failed to render preview');
                onError?.(e);
              }}
            />
          </div>
        );
      }

      const componentCode = components[selectedComponent];
      if (componentCode) {
        return (
          <div style={previewContentStyle}>
            <iframe
              srcDoc={generateHTMLPreview(componentCode, components, selectedComponent)}
              style={iframeStyle}
              title={`${selectedComponent} Preview`}
              onError={(e) => {
                setRenderError('Failed to render component');
                onError?.(e);
              }}
            />
          </div>
        );
      }

      return <div style={emptyStateStyle}>Component not found</div>;

    } catch (error) {
      setRenderError(error.message);
      onError?.(error);
      return (
        <div style={errorStateStyle}>
          <h3>⚠️ Render Error</h3>
          <p>{error.message}</p>
        </div>
      );
    }
  }, [components, mainApp, selectedComponent]);

  const generateHTMLPreview = (code, allComponents, componentName = 'App') => {
    const imports = Object.keys(allComponents)
      .filter(name => name !== componentName)
      .map(name => `
        const ${name} = ${allComponents[name].replace('export default', '').replace(/import.*?;/g, '').trim()};
      `).join('\n');

    const mainComponentCode = code
      .replace(/import.*?from.*?;/g, '')
      .replace('export default', '')
      .trim();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #fff;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    ${imports}

    const ${componentName} = ${mainComponentCode};

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<${componentName} />);
  </script>
</body>
</html>`;
  };

  const componentNames = Object.keys(components);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={tabsStyle}>
          <button
            onClick={() => setSelectedComponent('App')}
            style={{
              ...tabStyle,
              backgroundColor: selectedComponent === 'App' ? '#2196F3' : '#f5f5f5',
              color: selectedComponent === 'App' ? 'white' : '#333'
            }}
          >
            📱 App Preview
          </button>

          {componentNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedComponent(name)}
              style={{
                ...tabStyle,
                backgroundColor: selectedComponent === name ? '#2196F3' : '#f5f5f5',
                color: selectedComponent === name ? 'white' : '#333'
              }}
            >
              🧩 {name}
            </button>
          ))}
        </div>

        <div style={controlsStyle}>
          <button
            onClick={() => setShowCode(!showCode)}
            style={controlButtonStyle}
          >
            {showCode ? '👁️ Preview' : '💻 Code'}
          </button>

          <button
            onClick={loadComponents}
            style={controlButtonStyle}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={contentStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <div style={spinnerStyle}>⏳</div>
            <p>Generating your code...</p>
          </div>
        ) : renderError ? (
          <div style={errorStateStyle}>
            <h3>⚠️ Preview Error</h3>
            <p>{renderError}</p>
            <button onClick={() => setRenderError(null)} style={retryButtonStyle}>
              🔄 Retry
            </button>
          </div>
        ) : showCode ? (
          <div style={codeViewStyle}>
            <pre style={codeStyle}>
              <code>
                {selectedComponent === 'App' ? mainApp : components[selectedComponent] || 'Component not found'}
              </code>
            </pre>
          </div>
        ) : (
          renderPreview
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#f8f9fa',
};

const tabsStyle = {
  display: 'flex',
  gap: '5px',
};

const tabStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '20px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const controlsStyle = {
  display: 'flex',
  gap: '10px',
};

const controlButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
};

const contentStyle = {
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
};

const previewContentStyle = {
  width: '100%',
  height: '100%',
};

const iframeStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: '#fff',
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  color: '#666',
};

const featuresStyle = {
  marginTop: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '14px',
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#666',
};

const spinnerStyle = {
  fontSize: '48px',
  animation: 'spin 2s linear infinite',
};

const errorStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  color: '#f44336',
  padding: '20px',
};

const retryButtonStyle = {
  marginTop: '10px',
  padding: '8px 16px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const codeViewStyle = {
  height: '100%',
  overflow: 'auto',
  backgroundColor: '#f8f9fa',
};

const codeStyle = {
  padding: '20px',
  fontSize: '14px',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  lineHeight: '1.5',
  backgroundColor: '#f8f9fa',
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
};

export default Preview;