const fs = require('fs-extra');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ReactAppGenerator {
  constructor() {
    this.generatedAppsDir = path.join(__dirname, '../generated-apps');
    this.runningApps = new Map(); // appId -> { port, process, url }
    this.nextPort = 3100; // Start from port 3100 for generated apps
    this.claudeService = require('./ClaudeService');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.generatedAppsDir);
  }

  // Find next available port
  async findAvailablePort() {
    const net = require('net');

    const isPortFree = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(true));
          server.close();
        });
        server.on('error', () => resolve(false));
      });
    };

    let port = this.nextPort;
    while (port < 3200) {
      if (await isPortFree(port)) {
        this.nextPort = port + 1;
        return port;
      }
      port++;
    }
    throw new Error('No available ports found');
  }

  // Generate React app based on user prompt
  async generateReactApp(userPrompt) {
    console.log('🚀 Starting React app generation for prompt:', userPrompt);

    const appId = `app-${Date.now()}`;
    const appDir = path.join(this.generatedAppsDir, appId);

    try {
      // Step 1: Create React app directory structure
      await this.createReactAppStructure(appDir);

      // Step 2: Generate components using AI
      const generatedComponents = await this.generateComponents(userPrompt);

      // Step 3: Create main App.js with generated components
      await this.createMainApp(appDir, generatedComponents, userPrompt);

      // Step 4: Setup package.json and dependencies
      await this.setupPackageJson(appDir, appId);

      // Step 5: Install dependencies
      await this.installDependencies(appDir);

      // Step 6: Start the React app on available port
      const port = await this.findAvailablePort();
      const url = await this.startReactApp(appId, appDir, port);

      console.log('✅ React app generated successfully:', url);
      return { appId, url, port };

    } catch (error) {
      console.error('❌ Error generating React app:', error);
      throw error;
    }
  }

  async createReactAppStructure(appDir) {
    // Create basic React app structure
    await fs.ensureDir(path.join(appDir, 'src'));
    await fs.ensureDir(path.join(appDir, 'public'));

    // Create public/index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Generated React App</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    await fs.writeFile(path.join(appDir, 'public/index.html'), indexHtml);

    // Create src/index.js
    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;

    await fs.writeFile(path.join(appDir, 'src/index.js'), indexJs);
  }

  async generateComponents(userPrompt) {
    console.log('🤖 Generating components with AI...');

    try {
      // Use existing Claude service to generate components
      const rawCode = await this.claudeService.generateReactCode(
        `Create a complete React functional component based on this request: "${userPrompt}".

        IMPORTANT RULES:
        1. Return ONLY valid React component code, no explanations or markdown
        2. Start directly with "import React" statements
        3. End with "export default ComponentName;"
        4. Use functional components with hooks
        5. Include inline styles for immediate visual appeal
        6. Make it interactive and functional
        7. No markdown formatting, no explanatory text

        Generate the component code now:`,
        {}
      );

      // Clean the generated code to ensure it's valid React
      const cleanedCode = this.cleanGeneratedCode(rawCode, userPrompt);

      return {
        GeneratedApp: cleanedCode
      };
    } catch (error) {
      console.error('Error generating components:', error);
      // Fallback component
      return {
        GeneratedApp: this.getFallbackComponent(userPrompt)
      };
    }
  }

  cleanGeneratedCode(rawCode, userPrompt) {
    let cleanCode = rawCode;

    // Remove common AI response prefixes and suffixes
    const prefixesToRemove = [
      'Here is the generated code for',
      'Here\'s the React component',
      'Here is a React component',
      'Based on your request',
      'I\'ll create a',
      'Here\'s a',
      'This is a',
      'The following is',
      '```jsx',
      '```javascript',
      '```js',
      '```react',
      '```'
    ];

    const suffixesToRemove = [
      'This component provides',
      'This will create',
      'You can customize',
      'Feel free to modify',
      '```',
      'Hope this helps',
      'Let me know if'
    ];

    // Remove prefixes
    prefixesToRemove.forEach(prefix => {
      const regex = new RegExp(`^.*${prefix}.*?\\n`, 'i');
      cleanCode = cleanCode.replace(regex, '');
    });

    // Remove suffixes
    suffixesToRemove.forEach(suffix => {
      const regex = new RegExp(`\\n.*${suffix}.*$`, 'is');
      cleanCode = cleanCode.replace(regex, '');
    });

    // Remove markdown code blocks
    cleanCode = cleanCode.replace(/```[a-z]*\\n?/gi, '');
    cleanCode = cleanCode.replace(/```/g, '');

    // Ensure it starts with import
    if (!cleanCode.trim().startsWith('import')) {
      // Look for import statements within the text
      const importMatch = cleanCode.match(/import React.*?from 'react';/);
      if (importMatch) {
        const importIndex = cleanCode.indexOf(importMatch[0]);
        cleanCode = cleanCode.substring(importIndex);
      } else {
        // Add missing import
        cleanCode = `import React, { useState } from 'react';\\n\\n${cleanCode}`;
      }
    }

    // Ensure it ends with export
    if (!cleanCode.trim().endsWith(';')) {
      cleanCode = cleanCode.trim();
      if (!cleanCode.includes('export default')) {
        cleanCode += '\\n\\nexport default GeneratedApp;';
      }
    }

    // Validate basic structure
    if (!cleanCode.includes('function') && !cleanCode.includes('const') && !cleanCode.includes('=>')) {
      console.warn('Generated code seems malformed, using fallback');
      return this.getFallbackComponent(userPrompt);
    }

    return cleanCode.trim();
  }

  getFallbackComponent(userPrompt) {
    return `import React, { useState } from 'react';

const GeneratedApp = () => {
  const [message, setMessage] = useState('Hello from AI Generated App!');

  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      margin: '20px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🚀 AI Generated React App
      </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Request: "${userPrompt}"
      </p>
      <button
        onClick={() => setMessage('AI App is working! 🎉')}
        style={{
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Click me!
      </button>
      <p style={{ marginTop: '20px', color: '#333' }}>{message}</p>
    </div>
  );
};

export default GeneratedApp;`;
  }

  async createMainApp(appDir, components, userPrompt) {
    const componentImports = Object.keys(components)
      .map(name => `import ${name} from './${name}';`)
      .join('\n');

    const componentRenders = Object.keys(components)
      .map(name => `        <${name} />`)
      .join('\n');

    const appJs = `import React from 'react';
${componentImports}

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
          Generated from: "${userPrompt}"
        </p>
      </div>

${componentRenders}
    </div>
  );
}

export default App;`;

    await fs.writeFile(path.join(appDir, 'src/App.js'), appJs);

    // Write component files
    for (const [name, code] of Object.entries(components)) {
      await fs.writeFile(path.join(appDir, `src/${name}.js`), code);
    }
  }

  async setupPackageJson(appDir, appId) {
    const packageJson = {
      name: appId,
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
      },
      scripts: {
        "start": "BROWSER=none react-scripts start",
        "build": "react-scripts build"
      },
      browserslist: {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    };

    await fs.writeJson(path.join(appDir, 'package.json'), packageJson, { spaces: 2 });
  }

  async installDependencies(appDir) {
    console.log('📦 Installing dependencies...');

    try {
      await execAsync('npm install', {
        cwd: appDir,
        timeout: 120000 // 2 minutes timeout
      });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Error installing dependencies:', error);
      throw new Error('Failed to install dependencies');
    }
  }

  async startReactApp(appId, appDir, port) {
    console.log(`🚀 Starting React app on port ${port}...`);

    return new Promise((resolve, reject) => {
      const env = { ...process.env, PORT: port, BROWSER: 'none' };
      const child = spawn('npm', ['start'], {
        cwd: appDir,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('React app startup timeout'));
      }, 60000); // 1 minute timeout

      child.stdout.on('data', (data) => {
        output += data.toString();

        // Look for successful startup message
        if (output.includes('webpack compiled') || output.includes('Local:')) {
          clearTimeout(timeout);
          const url = `http://localhost:${port}`;

          // Store running app info
          this.runningApps.set(appId, {
            port,
            process: child,
            url,
            startTime: new Date()
          });

          console.log(`✅ React app started successfully: ${url}`);
          resolve(url);
        }
      });

      child.stderr.on('data', (data) => {
        console.log('React app stderr:', data.toString());
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      child.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`React app exited with code ${code}`));
        }
      });
    });
  }

  // Stop a running app
  stopApp(appId) {
    const app = this.runningApps.get(appId);
    if (app) {
      app.process.kill();
      this.runningApps.delete(appId);
      console.log(`🛑 Stopped app ${appId} on port ${app.port}`);
      return true;
    }
    return false;
  }

  // Get list of running apps
  getRunningApps() {
    const apps = [];
    for (const [appId, info] of this.runningApps.entries()) {
      apps.push({
        appId,
        url: info.url,
        port: info.port,
        startTime: info.startTime
      });
    }
    return apps;
  }

  // Clean up old apps (optional)
  async cleanupOldApps(maxAge = 30 * 60 * 1000) { // 30 minutes
    const now = Date.now();
    for (const [appId, info] of this.runningApps.entries()) {
      if (now - info.startTime.getTime() > maxAge) {
        this.stopApp(appId);
      }
    }
  }
}

module.exports = new ReactAppGenerator();