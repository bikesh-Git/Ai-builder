const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const claudeService = require('./ClaudeService');
const projectState = require('../utils/projectState');

class FixService {
  constructor() {
    this.commonErrors = {
      'Cannot resolve dependency': 'MISSING_DEPENDENCY',
      'Module not found': 'MISSING_DEPENDENCY',
      'Unexpected token': 'SYNTAX_ERROR',
      'SyntaxError': 'SYNTAX_ERROR',
      'TypeError': 'TYPE_ERROR',
      'ReferenceError': 'REFERENCE_ERROR',
      'is not defined': 'UNDEFINED_VARIABLE'
    };
  }

  analyzeError(errorMessage) {
    for (const [pattern, type] of Object.entries(this.commonErrors)) {
      if (errorMessage.includes(pattern)) {
        return {
          type,
          pattern,
          severity: this.getErrorSeverity(type)
        };
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      pattern: 'Unknown error pattern',
      severity: 'medium'
    };
  }

  getErrorSeverity(errorType) {
    const severityMap = {
      'MISSING_DEPENDENCY': 'high',
      'SYNTAX_ERROR': 'high',
      'TYPE_ERROR': 'medium',
      'REFERENCE_ERROR': 'medium',
      'UNDEFINED_VARIABLE': 'medium',
      'UNKNOWN_ERROR': 'low'
    };

    return severityMap[errorType] || 'low';
  }

  async extractMissingDependencies(errorMessage) {
    const dependencies = [];
    const patterns = [
      /Module not found.*?['"`]([^'"`]+)['"`]/g,
      /Cannot resolve dependency ['"`]([^'"`]+)['"`]/g,
      /Error: Cannot find module ['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(errorMessage)) !== null) {
        const dep = match[1];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          dependencies.push(dep);
        }
      }
    }

    return [...new Set(dependencies)];
  }

  async installDependencies(dependencies) {
    if (dependencies.length === 0) {
      return { success: true, message: 'No dependencies to install' };
    }

    const workspaceDir = projectState.workspaceDir;

    return new Promise((resolve) => {
      const command = `cd "${workspaceDir}" && npm install ${dependencies.join(' ')}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            message: `Failed to install dependencies: ${error.message}`,
            error: stderr
          });
        } else {
          resolve({
            success: true,
            message: `Successfully installed: ${dependencies.join(', ')}`,
            output: stdout
          });
        }
      });
    });
  }

  async autoFixCode(componentName, code, errorMessage) {
    try {
      const errorAnalysis = this.analyzeError(errorMessage);

      if (errorAnalysis.type === 'MISSING_DEPENDENCY') {
        const missingDeps = await this.extractMissingDependencies(errorMessage);

        if (missingDeps.length > 0) {
          const installResult = await this.installDependencies(missingDeps);

          await projectState.updatePackageJson(
            missingDeps.reduce((acc, dep) => {
              acc[dep] = 'latest';
              return acc;
            }, {})
          );

          if (!installResult.success) {
            throw new Error(installResult.message);
          }
        }
      }

      const fixedCode = await claudeService.fixCode(code, errorMessage);

      await projectState.saveComponent(componentName, fixedCode);

      return {
        success: true,
        fixedCode,
        errorType: errorAnalysis.type,
        message: `Fixed ${errorAnalysis.type.toLowerCase().replace('_', ' ')} in ${componentName}`
      };

    } catch (error) {
      console.error('Auto-fix error:', error);
      return {
        success: false,
        message: `Auto-fix failed: ${error.message}`,
        errorType: 'FIX_FAILED'
      };
    }
  }

  async validateReactCode(code) {
    const issues = [];

    if (!code.includes('import React') && !code.includes('from \'react\'')) {
      issues.push({
        type: 'MISSING_IMPORT',
        message: 'Missing React import',
        severity: 'high'
      });
    }

    if (!code.includes('export default') && !code.includes('module.exports')) {
      issues.push({
        type: 'MISSING_EXPORT',
        message: 'Missing default export',
        severity: 'high'
      });
    }

    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      issues.push({
        type: 'UNMATCHED_BRACES',
        message: 'Unmatched braces in code',
        severity: 'high'
      });
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      issues.push({
        type: 'UNMATCHED_PARENTHESES',
        message: 'Unmatched parentheses in code',
        severity: 'high'
      });
    }

    return {
      isValid: issues.filter(issue => issue.severity === 'high').length === 0,
      issues
    };
  }

  async runDiagnostics(componentName) {
    try {
      const code = await projectState.getComponent(componentName);

      if (!code) {
        return {
          success: false,
          message: `Component ${componentName} not found`
        };
      }

      const validation = await this.validateReactCode(code);

      const projectStructure = await projectState.getProjectStructure();

      return {
        success: true,
        validation,
        projectStructure: {
          componentCount: Object.keys(projectStructure.components).length,
          dependencies: Object.keys(projectStructure.packageJson.dependencies),
          hasErrors: !validation.isValid
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Diagnostics failed: ${error.message}`
      };
    }
  }
}

module.exports = new FixService();