const express = require('express');
const router = express.Router();
const claudeService = require('../services/ClaudeService');
const projectState = require('../utils/projectState');

router.post('/', async (req, res) => {
  console.log('🚀 Prompt API called with:', req.body);
  try {
    const { prompt, componentName } = req.body;

    if (!prompt) {
      console.log('❌ No prompt provided');
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('✅ Processing prompt:', prompt);

    console.log('📂 Getting existing components...');
    const existingComponents = await projectState.getAllComponents();
    console.log('📂 Existing components:', Object.keys(existingComponents));

    console.log('🔍 Analyzing components with Ollama...');
    const analysis = await claudeService.analyzeAndSuggestComponents(prompt);
    console.log('🔍 Analysis complete:', analysis);

    const results = [];

    for (const component of analysis.components) {
      const targetName = componentName || component.name;
      console.log('🎯 Generating code for component:', targetName);

      const generatedCode = await claudeService.generateReactCode(
        prompt,
        existingComponents
      );
      console.log('✅ Code generated for:', targetName);

      await projectState.saveComponent(targetName, generatedCode);

      results.push({
        name: targetName,
        code: generatedCode,
        action: component.action,
        purpose: component.purpose
      });
    }

    const updatedComponents = await projectState.getAllComponents();
    const mainAppCode = await projectState.createMainApp(updatedComponents);

    res.json({
      success: true,
      message: `Successfully generated ${results.length} component(s)`,
      components: results,
      allComponents: updatedComponents,
      mainApp: mainAppCode,
      analysis
    });

  } catch (error) {
    console.error('Prompt processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process prompt',
      error: error.message
    });
  }
});

router.get('/components', async (req, res) => {
  try {
    const components = await projectState.getAllComponents();
    const projectStructure = await projectState.getProjectStructure();

    res.json({
      success: true,
      components,
      projectStructure
    });

  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch components',
      error: error.message
    });
  }
});

router.put('/components/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    await projectState.saveComponent(name, code);

    const updatedComponents = await projectState.getAllComponents();
    const mainAppCode = await projectState.createMainApp(updatedComponents);

    res.json({
      success: true,
      message: `Component ${name} updated successfully`,
      component: { name, code },
      allComponents: updatedComponents,
      mainApp: mainAppCode
    });

  } catch (error) {
    console.error('Component update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update component',
      error: error.message
    });
  }
});

router.delete('/components/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const componentPath = `${projectState.workspaceDir}/components/${name}.jsx`;

    const fs = require('fs-extra');

    if (await fs.pathExists(componentPath)) {
      await fs.remove(componentPath);

      const updatedComponents = await projectState.getAllComponents();
      const mainAppCode = await projectState.createMainApp(updatedComponents);

      res.json({
        success: true,
        message: `Component ${name} deleted successfully`,
        allComponents: updatedComponents,
        mainApp: mainAppCode
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Component ${name} not found`
      });
    }

  } catch (error) {
    console.error('Component deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete component',
      error: error.message
    });
  }
});

module.exports = router;