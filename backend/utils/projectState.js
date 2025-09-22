const fs = require('fs-extra');
const path = require('path');

class ProjectState {
  constructor() {
    this.workspaceDir = path.join(__dirname, '../workspace');
    this.componentsDir = path.join(this.workspaceDir, 'components');
    this.initializeWorkspace();
  }

  async initializeWorkspace() {
    try {
      await fs.ensureDir(this.workspaceDir);
      await fs.ensureDir(this.componentsDir);

      const packageJsonPath = path.join(this.workspaceDir, 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        const defaultPackageJson = {
          name: "generated-react-app",
          version: "1.0.0",
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
          }
        };
        await fs.writeJson(packageJsonPath, defaultPackageJson, { spaces: 2 });
      }
    } catch (error) {
      console.error('Error initializing workspace:', error);
    }
  }

  async saveComponent(name, code) {
    try {
      const componentPath = path.join(this.componentsDir, `${name}.jsx`);
      await fs.writeFile(componentPath, code, 'utf8');
      return componentPath;
    } catch (error) {
      console.error('Error saving component:', error);
      throw error;
    }
  }

  async getComponent(name) {
    try {
      const componentPath = path.join(this.componentsDir, `${name}.jsx`);
      if (await fs.pathExists(componentPath)) {
        return await fs.readFile(componentPath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error('Error getting component:', error);
      return null;
    }
  }

  async getAllComponents() {
    try {
      await this.initializeWorkspace();

      const components = {};
      const files = await fs.readdir(this.componentsDir);

      for (const file of files) {
        if (file.endsWith('.jsx')) {
          const name = path.basename(file, '.jsx');
          const content = await fs.readFile(path.join(this.componentsDir, file), 'utf8');
          components[name] = content;
        }
      }

      return components;
    } catch (error) {
      console.error('Error getting all components:', error);
      return {};
    }
  }

  async updatePackageJson(dependencies) {
    try {
      const packageJsonPath = path.join(this.workspaceDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      packageJson.dependencies = { ...packageJson.dependencies, ...dependencies };

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      return packageJson;
    } catch (error) {
      console.error('Error updating package.json:', error);
      throw error;
    }
  }

  async getProjectStructure() {
    try {
      const components = await this.getAllComponents();
      const packageJsonPath = path.join(this.workspaceDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      return {
        components,
        packageJson,
        workspaceDir: this.workspaceDir
      };
    } catch (error) {
      console.error('Error getting project structure:', error);
      return null;
    }
  }

  async createMainApp(components) {
    try {
      const imports = Object.keys(components).map(name =>
        `import ${name} from './components/${name}';`
      ).join('\n');

      const componentsList = Object.keys(components).map(name =>
        `        <${name} />`
      ).join('\n');

      const appCode = `import React from 'react';
${imports}

function App() {
  return (
    <div className="App">
      <div style={{ padding: '20px' }}>
        <h1>Generated React App</h1>
${componentsList}
      </div>
    </div>
  );
}

export default App;`;

      const appPath = path.join(this.workspaceDir, 'App.jsx');
      await fs.writeFile(appPath, appCode, 'utf8');
      return appCode;
    } catch (error) {
      console.error('Error creating main App:', error);
      throw error;
    }
  }
}

module.exports = new ProjectState();