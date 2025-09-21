import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const promptAPI = {
  sendPrompt: async (prompt, componentName = null) => {
    const response = await api.post('/prompt', {
      prompt,
      componentName
    });
    return response.data;
  },

  getComponents: async () => {
    const response = await api.get('/prompt/components');
    return response.data;
  },

  updateComponent: async (name, code) => {
    const response = await api.put(`/prompt/components/${name}`, {
      code
    });
    return response.data;
  },

  deleteComponent: async (name) => {
    const response = await api.delete(`/prompt/components/${name}`);
    return response.data;
  }
};

export const githubAPI = {
  pushToGitHub: async (repoUrl, commitMessage) => {
    const response = await api.post('/github/push', {
      repoUrl,
      commitMessage
    });
    return response.data;
  },

  initializeRepo: async (repoUrl) => {
    const response = await api.post('/github/init', {
      repoUrl
    });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/github/status');
    return response.data;
  },

  setRemote: async (repoUrl) => {
    const response = await api.post('/github/remote', {
      repoUrl
    });
    return response.data;
  }
};

export const fixAPI = {
  fixCode: async (componentName, code, errorMessage) => {
    const response = await api.post('/fix', {
      componentName,
      code,
      errorMessage
    });
    return response.data;
  },

  validateCode: async (componentName, code) => {
    const response = await api.post(`/fix/validate/${componentName}`, {
      code
    });
    return response.data;
  },

  getDiagnostics: async (componentName = null) => {
    const url = componentName ? `/fix/diagnostics/${componentName}` : '/fix/diagnostics';
    const response = await api.get(url);
    return response.data;
  },

  installDependencies: async (dependencies) => {
    const response = await api.post('/fix/install', {
      dependencies
    });
    return response.data;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;