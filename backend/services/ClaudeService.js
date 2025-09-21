const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateReactCode(prompt, existingComponents = {}) {
    try {
      const systemPrompt = `You are an expert React developer. Generate clean, functional React components based on user prompts.

RULES:
1. Always return valid JSX code that can be directly saved as a .jsx file
2. Use modern React with hooks (useState, useEffect, etc.)
3. Include necessary imports
4. Make components functional and interactive when appropriate
5. Use inline styles or className for styling
6. Return only the component code, no explanations
7. If updating existing components, maintain their structure but apply the requested changes

Existing components in the project:
${Object.keys(existingComponents).map(name => `- ${name}: Available component`).join('\n')}

Generate React component code that fulfills this request:`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      let code = response.content[0].text;

      // Clean up markdown formatting
      code = code.replace(/```jsx\n/g, '').replace(/```js\n/g, '').replace(/```javascript\n/g, '').replace(/```\n/g, '').replace(/```$/g, '');

      return code;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to generate code with Claude API');
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

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Fix this React code:

CODE:
${code}

ERROR:
${error}

Return the corrected code:`
        }]
      });

      let code = response.content[0].text;

      // Clean up markdown formatting
      code = code.replace(/```jsx\n/g, '').replace(/```js\n/g, '').replace(/```javascript\n/g, '').replace(/```\n/g, '').replace(/```$/g, '');

      return code;
    } catch (error) {
      console.error('Claude Fix API Error:', error);
      throw new Error('Failed to fix code with Claude API');
    }
  }

  async analyzeAndSuggestComponents(prompt) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.5,
        system: `Analyze the user's prompt and suggest what React components should be created or modified. Return a JSON object with component names and their purposes.

Format:
{
  "components": [
    {
      "name": "ComponentName",
      "purpose": "Brief description of what this component does",
      "action": "create" or "update"
    }
  ]
}`,
        messages: [{
          role: 'user',
          content: `Analyze this request and suggest components: ${prompt}`
        }]
      });

      try {
        return JSON.parse(response.content[0].text);
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
      console.error('Claude Analysis Error:', error);
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

module.exports = new ClaudeService();