const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

class GitHubService {
  constructor() {
    this.git = null;
    this.repoPath = null;
  }

  validateGitHubUrl(url) {
    // Accept both HTTPS and SSH GitHub URLs, with or without .git suffix
    const githubUrlPatterns = [
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/,
      /^git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?$/
    ];

    return githubUrlPatterns.some(pattern => pattern.test(url));
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
          if (!this.validateGitHubUrl(gitUrl)) {
            throw new Error('Invalid GitHub repository URL. Please use format: https://github.com/username/repository or https://github.com/username/repository.git');
          }
          await this.git.addRemote('origin', gitUrl);
        }
      } else {
        // Repository already exists, just update remote if needed
        if (gitUrl) {
          if (!this.validateGitHubUrl(gitUrl)) {
            throw new Error('Invalid GitHub repository URL. Please use format: https://github.com/username/repository or https://github.com/username/repository.git');
          }
          await this.setRemoteUrl(gitUrl);
        }
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
          // Get current branch name
          const status = await this.git.status();
          const currentBranch = status.current;

          await this.git.push('origin', currentBranch);
          return {
            success: true,
            message: `Successfully pushed ${status.files.length} files to GitHub`,
            files: status.files.map(f => f.path)
          };
        } catch (pushError) {
          try {
            // Fallback to main if current branch fails
            await this.git.push('origin', 'main');
            return {
              success: true,
              message: `Successfully pushed ${status.files.length} files to GitHub`,
              files: status.files.map(f => f.path)
            };
          } catch (pushError2) {
            try {
              // Fallback to master as last resort
              await this.git.push('origin', 'master');
              return {
                success: true,
                message: `Successfully pushed ${status.files.length} files to GitHub`,
                files: status.files.map(f => f.path)
              };
            } catch (pushError3) {
            console.error('Push error:', pushError3);
            const errorMessage = pushError3.message || pushError3.toString();

            if (errorMessage.includes('authentication')) {
              return {
                success: false,
                message: 'Authentication failed. Please check your GitHub credentials and repository access.',
                localCommit: true,
                error: 'AUTHENTICATION_ERROR'
              };
            } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
              return {
                success: false,
                message: 'Repository not found. Please check if the repository URL is correct and you have access to it.',
                localCommit: true,
                error: 'REPOSITORY_NOT_FOUND'
              };
            } else {
              return {
                success: false,
                message: `Failed to push to GitHub: ${errorMessage}`,
                localCommit: true,
                error: 'PUSH_ERROR'
              };
            }
          }
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