const express = require('express');
const router = express.Router();
const githubService = require('../services/GitHubService');
const projectState = require('../utils/projectState');
const path = require('path');

router.post('/push', async (req, res) => {
  try {
    const { repoUrl, commitMessage } = req.body;

    const repoPath = path.join(__dirname, '../git-repo');

    await githubService.initializeRepo(repoPath, repoUrl);

    await githubService.copyWorkspaceToRepo(projectState.workspaceDir);

    const result = await githubService.commitAndPush(
      commitMessage || 'AI Generated Code Update'
    );

    res.json({
      success: result.success,
      message: result.message,
      files: result.files || [],
      localCommit: result.localCommit || false
    });

  } catch (error) {
    console.error('GitHub push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to push to GitHub',
      error: error.message
    });
  }
});

router.post('/init', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL is required'
      });
    }

    const repoPath = path.join(__dirname, '../git-repo');

    await githubService.initializeRepo(repoPath, repoUrl);

    res.json({
      success: true,
      message: 'Repository initialized successfully',
      repoPath
    });

  } catch (error) {
    console.error('GitHub init error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize repository',
      error: error.message
    });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await githubService.getStatus();

    if (!status) {
      return res.json({
        success: true,
        initialized: false,
        message: 'No repository initialized'
      });
    }

    res.json({
      success: true,
      initialized: true,
      status: {
        files: status.files,
        ahead: status.ahead,
        behind: status.behind,
        currentBranch: status.current,
        remotes: status.remotes
      }
    });

  } catch (error) {
    console.error('GitHub status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get repository status',
      error: error.message
    });
  }
});

router.post('/remote', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL is required'
      });
    }

    await githubService.setRemoteUrl(repoUrl);

    res.json({
      success: true,
      message: 'Remote URL updated successfully'
    });

  } catch (error) {
    console.error('GitHub remote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set remote URL',
      error: error.message
    });
  }
});

module.exports = router;