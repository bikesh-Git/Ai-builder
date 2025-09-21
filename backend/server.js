const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Load routes with error handling
try {
  const promptRoutes = require('./routes/prompt');
  const githubRoutes = require('./routes/github');
  const fixRoutes = require('./routes/fix');
  const previewRoutes = require('./routes/preview');

  app.use('/api/prompt', promptRoutes);
  app.use('/api/github', githubRoutes);
  app.use('/api/fix', fixRoutes);
  app.use('/preview', previewRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Code Generator Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});