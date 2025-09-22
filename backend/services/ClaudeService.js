const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3:latest';
  }

  async generateReactCode(prompt, existingComponents = {}) {
    try {
      const systemPrompt = `You are an expert React developer. Generate ONLY valid React component code.

CRITICAL RULES:
1. Return ONLY React component code - NO explanations, NO markdown, NO descriptions
2. Start with "import React" and end with "export default ComponentName;"
3. Use functional components with hooks (useState, useEffect, etc.)
4. Include inline styles for immediate functionality
5. Make components interactive and functional
6. NO code blocks or explanatory text
7. Component must be syntactically correct and runnable

Generate React component code for this request:`;

      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1000
        }
      });

      let code = response.data.response;

      // Clean up markdown formatting
      code = code.replace(/```jsx\n/g, '').replace(/```js\n/g, '').replace(/```javascript\n/g, '').replace(/```\n/g, '').replace(/```$/g, '');

      return code;
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw new Error('Failed to generate code with Ollama API');
    }
  }

  async fixCode(code, error) {
    try {
      const systemPrompt = `You are an expert React developer. Fix the provided React code based on the error message.

RULES:
1. Return only the corrected code
2. Fix syntax errors, import issues, and logic problems
3. Maintain the component's intended functionality
4. Use modern React patterns
5. Return valid JSX code that can be directly saved`;

      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: `${systemPrompt}\n\nFix this React code:

CODE:
${code}

ERROR:
${error}

Return the corrected code:`,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 4000
        }
      });

      let fixedCode = response.data.response;

      // Clean up markdown formatting
      fixedCode = fixedCode.replace(/```jsx\n/g, '').replace(/```js\n/g, '').replace(/```javascript\n/g, '').replace(/```\n/g, '').replace(/```$/g, '');

      return fixedCode;
    } catch (error) {
      console.error('Ollama Fix API Error:', error);
      throw new Error('Failed to fix code with Ollama API');
    }
  }

  async analyzeAndSuggestComponents(prompt) {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: `Analyze the user's prompt and suggest what React components should be created or modified. Return a JSON object with component names and their purposes.

Format:
{
  "components": [
    {
      "name": "ComponentName",
      "purpose": "Brief description of what this component does",
      "action": "create" or "update"
    }
  ]
}

Analyze this request and suggest components: ${prompt}`,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 500
        }
      });

      try {
        return JSON.parse(response.data.response);
      } catch (parseError) {
        return {
          components: [{
            name: "GeneratedComponent",
            purpose: "Component based on user request",
            action: "create"
          }]
        };
      }
    } catch (error) {
      console.error('Ollama Analysis Error:', error);
      return {
        components: [{
          name: "GeneratedComponent",
          purpose: "Component based on user request",
          action: "create"
        }]
      };
    }
  }
}

module.exports = new OllamaService();