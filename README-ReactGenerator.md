# 🤖 AI-Powered React App Generator

An AI-powered platform that generates complete, runnable React applications from natural language prompts with live preview functionality.

## ✨ Features

- **AI-Powered Generation**: Uses Ollama AI to generate complete React applications from user prompts
- **Dynamic Port Management**: Automatically finds available ports for generated apps (starting from 3100)
- **Live Preview**: Instant iframe preview of generated React applications
- **Multiple Apps**: Generate and manage multiple React apps simultaneously
- **Complete App Structure**: Creates full React app with package.json, dependencies, and proper structure
- **Auto-Installation**: Automatically installs NPM dependencies for generated apps
- **Interactive UI**: Beautiful, responsive interface for app generation and management

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running locally
3. **Git** (for optional GitHub integration)

### Installation & Setup

1. **Start Ollama** (if not already running):
   ```bash
   ollama serve
   # Make sure llama3:latest model is available
   ollama pull llama3:latest
   ```

2. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start the Backend Server**:
   ```bash
   cd backend
   node server.js
   ```
   ✅ Backend will run on `http://localhost:3001`

4. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   ✅ Frontend will run on `http://localhost:3000`

## 🎯 How to Use

### Method 1: Using the Web Interface

1. **Open your browser** and go to `http://localhost:3000`

2. **Enter a prompt** in the text area, for example:
   - "Create a simple calculator app"
   - "Build a todo list with add, delete, and complete functionality"
   - "Make a weather dashboard with location search"
   - "Create a blog with posts and comments"

3. **Click "Generate React App"** and wait for the magic to happen!

4. **View the Live Preview** in the iframe or click "Open in New Tab"

### Method 2: Using the API Directly

```bash
# Generate a new React app
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "Create a simple calculator app"}'

# Response will include the running app URL
{
  "success": true,
  "message": "React app generated successfully",
  "appId": "app-1732212345678",
  "url": "http://localhost:3100",
  "port": 3100,
  "prompt": "Create a simple calculator app"
}
```

### Method 3: Managing Generated Apps

```bash
# List all running apps
curl http://localhost:3001/api/generate/apps

# Stop a specific app
curl -X POST http://localhost:3001/api/generate/stop/app-1732212345678
```

## 🔧 API Endpoints

### Main App Generator
- **POST `/api/generate`**
  - Body: `{"userPrompt": "Your app description"}`
  - Returns: Generated app info with URL and port

### App Management
- **GET `/api/generate/apps`** - List all running generated apps
- **POST `/api/generate/stop/:appId`** - Stop a specific app

### Health Check
- **GET `/health`** - Check if backend is running

## 📁 Project Structure

```
ai-chat-app/
├── backend/
│   ├── services/
│   │   ├── ReactAppGenerator.js    # Main app generation logic
│   │   └── ClaudeService.js        # Ollama AI integration
│   ├── routes/
│   │   ├── generate.js             # API routes for app generation
│   │   └── ...                     # Other routes
│   ├── generated-apps/             # Auto-created: stores generated apps
│   └── server.js                   # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ReactAppGenerator.jsx  # Main UI component
│   │   ├── App-ReactGenerator.jsx     # App wrapper
│   │   └── main.jsx                   # Entry point
│   └── ...
└── README-ReactGenerator.md          # This file
```

## 🎮 Example Usage Scenarios

### Scenario 1: Todo List App
```
Prompt: "Create a todo list with add, delete, and mark complete functionality"
Result: Full React app with state management, CRUD operations, and styled UI
```

### Scenario 2: Calculator
```
Prompt: "Build a calculator app with basic arithmetic operations"
Result: Interactive calculator with buttons, display, and proper calculations
```

### Scenario 3: Dashboard
```
Prompt: "Make a dashboard with user stats, charts, and navigation"
Result: Multi-component dashboard with mock data and interactive elements
```

## 🔍 What Happens Behind the Scenes

1. **Prompt Analysis**: AI analyzes your prompt to understand requirements
2. **Code Generation**: Ollama generates React component code
3. **Project Setup**: Creates complete React app structure with:
   - `package.json` with proper dependencies
   - `src/` folder with components
   - `public/` folder with HTML template
   - Proper imports and exports
4. **Dependency Installation**: Runs `npm install` automatically
5. **Port Assignment**: Finds next available port (3100, 3101, etc.)
6. **App Startup**: Starts React development server
7. **URL Response**: Returns live URL for immediate access

## 🛠 Troubleshooting

### Common Issues

1. **"No available ports found"**
   - Generated apps use ports 3100-3199
   - Stop unused apps or restart the backend

2. **"Failed to install dependencies"**
   - Check internet connection
   - Ensure NPM is properly installed

3. **"Ollama API Error"**
   - Make sure Ollama is running (`ollama serve`)
   - Verify llama3:latest model is available (`ollama list`)

4. **Apps not loading in preview**
   - Generated apps may take a moment to start
   - Try refreshing the preview iframe

### Port Configuration

- Frontend: `3000`
- Backend: `3001`
- Generated Apps: `3100+` (auto-assigned)

## 🔧 Configuration

### Environment Variables (.env)
```
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:latest

# Server Configuration
PORT=3001
```

### Customizing Generated Apps

The generator creates apps with:
- React 18
- Modern hooks (useState, useEffect)
- Inline styles for immediate functionality
- Responsive design
- Error boundaries

## 🚀 Advanced Features

### Multiple Apps
- Generate multiple apps simultaneously
- Each app runs on its own port
- Manage all apps from one interface

### Live Preview
- Instant iframe preview
- Refresh capability
- Full-screen viewing option

### App Management
- List all running apps
- Stop individual apps
- View app details and prompts

## 🎉 Success Indicators

✅ **Backend running**: Server log shows "Server running on port 3001"
✅ **Frontend accessible**: Can open http://localhost:3000
✅ **Ollama connected**: No "Ollama API Error" messages
✅ **App generated**: Response includes valid URL like http://localhost:3100
✅ **Live preview working**: Can see generated app in iframe

## 📝 Notes

- Generated apps are stored in `backend/generated-apps/`
- Each app gets a unique timestamp-based ID
- Apps automatically clean up after a period of inactivity
- The system is optimized for fast generation and minimal conflicts

---

🎯 **Ready to build amazing React apps with AI? Start by opening http://localhost:3000 and enter your first prompt!**