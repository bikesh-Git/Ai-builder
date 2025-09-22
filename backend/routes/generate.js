const express = require('express');
const router = express.Router();
const reactAppGenerator = require('../services/ReactAppGenerator');

// Generate a new React app based on user prompt
router.post('/', async (req, res) => {
  try {
    const { userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        message: 'userPrompt is required'
      });
    }

    console.log('🎯 Generating React app for prompt:', userPrompt);

    // Generate the React app
    const result = await reactAppGenerator.generateReactApp(userPrompt);

    res.json({
      success: true,
      message: 'React app generated successfully',
      appId: result.appId,
      url: result.url,
      port: result.port,
      prompt: userPrompt
    });

  } catch (error) {
    console.error('Error generating React app:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate React app',
      error: error.message
    });
  }
});

// Get list of running apps
router.get('/apps', (req, res) => {
  try {
    const runningApps = reactAppGenerator.getRunningApps();
    res.json({
      success: true,
      apps: runningApps
    });
  } catch (error) {
    console.error('Error getting running apps:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get running apps',
      error: error.message
    });
  }
});

// Stop a specific app
router.post('/stop/:appId', (req, res) => {
  try {
    const { appId } = req.params;
    const stopped = reactAppGenerator.stopApp(appId);

    if (stopped) {
      res.json({
        success: true,
        message: `App ${appId} stopped successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `App ${appId} not found`
      });
    }
  } catch (error) {
    console.error('Error stopping app:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop app',
      error: error.message
    });
  }
});

module.exports = router;