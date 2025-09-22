const express = require('express');
const router = express.Router();
const projectState = require('../utils/projectState');

router.get('/', async (req, res) => {
  try {
    const components = await projectState.getAllComponents();
    const mainApp = await projectState.createMainApp(components);

    // Generate the complete HTML for the React app
    const html = generatePreviewHTML(components, mainApp);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(html);

  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).send(generateErrorHTML(error.message));
  }
});

const generatePreviewHTML = (components, mainApp) => {
  // Convert components to importable format
  const componentDefinitions = Object.entries(components)
    .map(([name, code], index) => {
      // Clean up the component code and make it importable
      let cleanCode = code
        .replace(/import.*?from.*?;/g, '') // Remove imports
        .replace(/export default.*?;/g, '') // Remove export statements
        .trim();

      // Rename conflicting variable names to make them unique
      cleanCode = cleanCode.replace(/const styles = {/g, `const ${name.toLowerCase()}Styles = {`);
      cleanCode = cleanCode.replace(/style={styles\./g, `style={${name.toLowerCase()}Styles.`);
      cleanCode = cleanCode.replace(/styles\./g, `${name.toLowerCase()}Styles.`);

      // If the code doesn't start with a function/const declaration, wrap it
      if (!cleanCode.match(/^(const|function|class)/)) {
        cleanCode = `const ${name} = ${cleanCode}`;
      }

      return `// ${name} Component\n${cleanCode}`;
    })
    .join('\n\n');

  // Create the main app code
  let appCode = mainApp || `
    function App() {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Generated React App</h1>
          <p>No components generated yet. Use the chat to create some!</p>
        </div>
      );
    }
  `;

  // Clean up the app code
  appCode = appCode
    .replace(/import.*?from.*?;/g, '') // Remove imports
    .replace(/export default.*?;/g, '') // Remove export statements
    .trim();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live React App Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: #fff;
        }
        * {
            box-sizing: border-box;
        }
        .preview-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .app-wrapper {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .preview-header {
            background: #f8f9fa;
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
        }
        .preview-title {
            margin: 0;
            color: #495057;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #28a745;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="app-wrapper">
            <div class="preview-header">
                <h3 class="preview-title">
                    <span class="status-indicator"></span>
                    Live React App Preview
                    <span style="margin-left: auto; font-size: 12px; color: #6c757d;">
                        AI Generated
                    </span>
                </h3>
            </div>
            <div id="root"></div>
        </div>
    </div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        ${componentDefinitions}

        ${appCode}

        // Render the app
        const root = ReactDOM.createRoot(document.getElementById('root'));

        try {
            root.render(<App />);
        } catch (error) {
            console.error('Render error:', error);
            root.render(
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    margin: '20px',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <h3>🚨 Preview Render Error</h3>
                    <p><strong>Error:</strong> {error.message}</p>
                    <p>This error occurred while rendering the generated components.</p>
                    <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            🔍 Troubleshooting Tips
                        </summary>
                        <ul style={{ marginTop: '10px', lineHeight: '1.6' }}>
                            <li>Check for syntax errors in component code</li>
                            <li>Verify all variables and functions are properly defined</li>
                            <li>Ensure JSX is properly formatted</li>
                            <li>Use the "Try & Fix" button in the Error Panel for automatic resolution</li>
                        </ul>
                    </details>
                </div>
            );
        }
    </script>
</body>
</html>`;
};

const generateErrorHTML = (errorMessage) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Error</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
        }
        .error-container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .error-title {
            color: #dc3545;
            margin-bottom: 10px;
        }
        .error-message {
            color: #6c757d;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Preview Generation Failed</h2>
        <p class="error-message">${errorMessage}</p>
        <p class="error-message">Please generate some components using the chat interface first.</p>
    </div>
</body>
</html>`;
};

module.exports = router;