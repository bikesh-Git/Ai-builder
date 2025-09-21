# 🤖 AI Code Generator

A production-ready full-stack application that generates React components using Claude AI and integrates with GitHub for seamless code deployment.

## ✨ Features

- 🗣️ **AI Chat Interface** - Natural language prompting to generate React components
- 🔧 **Auto-Fix Errors** - Intelligent error detection and automatic code fixing
- 👁️ **Live Preview** - Real-time rendering of generated components
- 🚀 **GitHub Integration** - One-click push to GitHub repositories
- 📊 **Error Panel** - Comprehensive error tracking and diagnostics
- 🔄 **Incremental Updates** - Only applies relevant changes, maintains project state

## 🏗️ Architecture

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Claude API integration
- **Version Control**: GitHub API + simple-git

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- GitHub account (for repository integration)
- Claude API key (already configured in `.env`)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
fullstack-app/
├── backend/                 # Express.js backend
│   ├── server.js           # Main server file
│   ├── routes/             # API routes
│   │   ├── prompt.js       # Claude AI integration
│   │   ├── github.js       # GitHub operations
│   │   └── fix.js          # Error fixing
│   ├── services/           # Business logic
│   │   ├── ClaudeService.js    # Claude API client
│   │   ├── GitHubService.js    # GitHub operations
│   │   └── FixService.js       # Error handling
│   └── utils/
│       └── projectState.js     # Project state management
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.jsx      # Top navigation
│   │   │   ├── Sidebar.jsx     # Chat interface
│   │   │   ├── Preview.jsx     # Live preview
│   │   │   └── ErrorPanel.jsx  # Error management
│   │   ├── App.jsx         # Main application
│   │   ├── main.jsx        # Entry point
│   │   └── api.js          # API client
│   └── vite.config.js      # Vite configuration
│
├── package.json            # Root package.json
└── .env                    # Environment variables
```

## 🎯 How to Use

### 1. Generate Components

1. Type your request in the chat sidebar:
   - "Create a todo list component with add, delete, and toggle functionality"
   - "Build a user profile card with avatar, name, and contact info"
   - "Make a simple calculator with basic math operations"

2. Claude AI will generate React components based on your description

3. View the live preview instantly in the main panel

### 2. Handle Errors

- If errors occur, they'll appear in the Error Panel (bottom-right)
- Click "🔧 Try & Fix" to automatically resolve issues
- View detailed error information by clicking "👁️ Details"

### 3. Push to GitHub

1. Click "🚀 Push to GitHub" in the header
2. Enter your GitHub repository URL
3. Add a commit message (optional)
4. Your generated code will be pushed to the repository

## 🔧 API Endpoints

### Prompt API
- `POST /api/prompt` - Generate code from natural language
- `GET /api/prompt/components` - Get all generated components
- `PUT /api/prompt/components/:name` - Update a component
- `DELETE /api/prompt/components/:name` - Delete a component

### GitHub API
- `POST /api/github/push` - Push code to GitHub
- `POST /api/github/init` - Initialize repository
- `GET /api/github/status` - Get repository status
- `POST /api/github/remote` - Set remote URL

### Fix API
- `POST /api/fix` - Auto-fix code errors
- `POST /api/fix/validate/:componentName` - Validate component code
- `GET /api/fix/diagnostics` - Run diagnostics
- `POST /api/fix/install` - Install missing dependencies

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Environment Variables

The application uses the following environment variables (already configured):

```env
ANTHROPIC_API_KEY=your_claude_api_key
GITHUB_API_KEY=your_github_api_key
PORT=3001
```

## 🎨 Features in Detail

### AI-Powered Code Generation
- Uses Claude AI to understand natural language prompts
- Generates clean, functional React components
- Supports complex component requests with multiple features

### Live Preview
- Real-time rendering using iframe sandboxing
- Supports both individual components and full app preview
- Automatic updates when code changes

### Error Management
- Detects syntax errors, missing dependencies, and runtime issues
- Provides detailed error information and stack traces
- Auto-fix functionality using Claude AI

### GitHub Integration
- Initialize new repositories
- Commit and push generated code
- Support for existing repositories
- Automatic .gitignore and README generation

### Project State Management
- Maintains generated components in workspace
- Supports incremental updates
- Automatic dependency management

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if port 3001 is available
   - Verify environment variables in `.env`

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 3001
   - Check proxy configuration in `vite.config.js`

3. **Claude API errors:**
   - Verify your API key is valid
   - Check API rate limits

4. **GitHub push fails:**
   - Ensure repository URL is correct
   - Check repository permissions
   - Verify GitHub API key (if using authenticated endpoints)

### Debug Mode

To run with debug logging:
```bash
DEBUG=* npm run dev
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Claude AI**