const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

class GitHubService {
  constructor() {
    this.git = null;
    this.repoPath = null;
  }

  async initializeRepo(repoPath, gitUrl = null) {
    try {
      this.repoPath = repoPath;
      await fs.ensureDir(repoPath);

      this.git = simpleGit(repoPath);

      const isRepo = await this.git.checkIsRepo();

      if (!isRepo) {
        await this.git.init();

        if (gitUrl) {
          await this.git.addRemote('origin', gitUrl);
        }

        const gitignorePath = path.join(repoPath, '.gitignore');
        const gitignoreContent = `node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
.DS_Store
*.log`;

        await fs.writeFile(gitignorePath, gitignoreContent);

        const readmePath = path.join(repoPath, 'README.md');
        const readmeContent = `# Generated React App

This is an AI-generated React application created with Claude AI.

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`
`;
        await fs.writeFile(readmePath, readmeContent);
      }

      return true;
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  }

  async commitAndPush(commitMessage = 'AI Generated Code Update') {
    try {
      if (!this.git) {
        throw new Error('Repository not initialized');
      }

      await this.git.add('.');

      const status = await this.git.status();

      if (status.files.length === 0) {
        return { success: true, message: 'No changes to commit' };
      }

      await this.git.commit(commitMessage);

      const remotes = await this.git.getRemotes(true);

      if (remotes.length > 0) {
        try {
          await this.git.push('origin', 'main');
          return {
            success: true,
            message: `Successfully pushed ${status.files.length} files to GitHub`,
            files: status.files.map(f => f.path)
          };
        } catch (pushError) {
          try {
            await this.git.push('origin', 'master');
            return {
              success: true,
              message: `Successfully pushed ${status.files.length} files to GitHub`,
              files: status.files.map(f => f.path)
            };
          } catch (pushError2) {
            console.error('Push error:', pushError2);
            return {
              success: false,
              message: 'Failed to push to remote repository. Please check your repository settings.',
              localCommit: true
            };
          }
        }
      } else {
        return {
          success: true,
          message: 'Changes committed locally. No remote repository configured.',
          localCommit: true
        };
      }

    } catch (error) {
      console.error('Error committing and pushing:', error);
      throw error;
    }
  }

  async copyWorkspaceToRepo(workspacePath) {
    try {
      if (!this.repoPath) {
        throw new Error('Repository path not set');
      }

      const srcDir = path.join(this.repoPath, 'src');
      await fs.ensureDir(srcDir);

      await fs.copy(workspacePath, srcDir, {
        overwrite: true,
        filter: (src) => {
          return !src.includes('node_modules') && !src.includes('.git');
        }
      });

      const packageJsonSource = path.join(workspacePath, 'package.json');
      const packageJsonDest = path.join(this.repoPath, 'package.json');

      if (await fs.pathExists(packageJsonSource)) {
        const packageJson = await fs.readJson(packageJsonSource);

        packageJson.scripts = {
          start: "react-scripts start",
          build: "react-scripts build",
          test: "react-scripts test",
          eject: "react-scripts eject",
          ...packageJson.scripts
        };

        packageJson.dependencies = {
          ...packageJson.dependencies,
          "react-scripts": "5.0.1"
        };

        await fs.writeJson(packageJsonDest, packageJson, { spaces: 2 });
      }

      return true;
    } catch (error) {
      console.error('Error copying workspace to repo:', error);
      throw error;
    }
  }

  async setRemoteUrl(gitUrl) {
    try {
      if (!this.git) {
        throw new Error('Repository not initialized');
      }

      const remotes = await this.git.getRemotes();

      if (remotes.find(r => r.name === 'origin')) {
        await this.git.removeRemote('origin');
      }

      await this.git.addRemote('origin', gitUrl);

      return true;
    } catch (error) {
      console.error('Error setting remote URL:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      if (!this.git) {
        return null;
      }

      const status = await this.git.status();
      const remotes = await this.git.getRemotes(true);

      return {
        files: status.files,
        ahead: status.ahead,
        behind: status.behind,
        current: status.current,
        remotes: remotes
      };
    } catch (error) {
      console.error('Error getting git status:', error);
      return null;
    }
  }
}

module.exports = new GitHubService();