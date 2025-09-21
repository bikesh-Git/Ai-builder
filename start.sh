#!/bin/bash

echo "🚀 Starting AI Code Generator..."

# Kill any existing processes on the ports
echo "🔄 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "📦 Starting backend server..."
cd backend && node server.js &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting frontend development server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📝 To stop the application, press Ctrl+C"
echo ""

# Function to cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Stopping application..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Application stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait