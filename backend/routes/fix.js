const express = require('express');
const router = express.Router();
const fixService = require('../services/FixService');
const projectState = require('../utils/projectState');

router.post('/', async (req, res) => {
  try {
    const { componentName, code, errorMessage } = req.body;

    if (!componentName || !errorMessage) {
      return res.status(400).json({
        success: false,
        message: 'Component name and error message are required'
      });
    }

    const codeToFix = code || await projectState.getComponent(componentName);

    if (!codeToFix) {
      return res.status(404).json({
        success: false,
        message: `Component ${componentName} not found`
      });
    }

    const fixResult = await fixService.autoFixCode(componentName, codeToFix, errorMessage);

    if (fixResult.success) {
      const updatedComponents = await projectState.getAllComponents();
      const mainAppCode = await projectState.createMainApp(updatedComponents);

      res.json({
        success: true,
        message: fixResult.message,
        fixedCode: fixResult.fixedCode,
        errorType: fixResult.errorType,
        component: {
          name: componentName,
          code: fixResult.fixedCode
        },
        allComponents: updatedComponents,
        mainApp: mainAppCode
      });
    } else {
      res.status(500).json({
        success: false,
        message: fixResult.message,
        errorType: fixResult.errorType
      });
    }

  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix code',
      error: error.message
    });
  }
});

router.post('/validate/:componentName', async (req, res) => {
  try {
    const { componentName } = req.params;
    const { code } = req.body;

    const codeToValidate = code || await projectState.getComponent(componentName);

    if (!codeToValidate) {
      return res.status(404).json({
        success: false,
        message: `Component ${componentName} not found`
      });
    }

    const validation = await fixService.validateReactCode(codeToValidate);

    res.json({
      success: true,
      validation,
      componentName
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate code',
      error: error.message
    });
  }
});

router.get('/diagnostics/:componentName?', async (req, res) => {
  try {
    const { componentName } = req.params;

    if (componentName) {
      const diagnostics = await fixService.runDiagnostics(componentName);
      res.json(diagnostics);
    } else {
      const allComponents = await projectState.getAllComponents();
      const diagnostics = {};

      for (const [name] of Object.entries(allComponents)) {
        diagnostics[name] = await fixService.runDiagnostics(name);
      }

      res.json({
        success: true,
        diagnostics,
        componentCount: Object.keys(allComponents).length
      });
    }

  } catch (error) {
    console.error('Diagnostics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run diagnostics',
      error: error.message
    });
  }
});

router.post('/install', async (req, res) => {
  try {
    const { dependencies } = req.body;

    if (!dependencies || !Array.isArray(dependencies)) {
      return res.status(400).json({
        success: false,
        message: 'Dependencies array is required'
      });
    }

    const installResult = await fixService.installDependencies(dependencies);

    if (installResult.success) {
      await projectState.updatePackageJson(
        dependencies.reduce((acc, dep) => {
          acc[dep] = 'latest';
          return acc;
        }, {})
      );
    }

    res.json(installResult);

  } catch (error) {
    console.error('Install error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to install dependencies',
      error: error.message
    });
  }
});

module.exports = router;