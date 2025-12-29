
/**
 * VELOCITY BACKEND SPECIFICATION
 * 
 * Deployment: Railway, Heroku, or Google Cloud Run
 * Purpose: Provides high-bandwidth endpoints for download/upload testing
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Cache-Control']
}));

// 1. Download Endpoint
// Serves an infinite stream of random garbage data
app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Disposition', 'attachment; filename=garbage.bin');
  
  const size = parseInt(req.query.bytes) || 1024 * 1024 * 100; // Default 100MB
  let sent = 0;
  const chunkSize = 64 * 1024;

  const sendChunk = () => {
    if (sent >= size) {
      res.end();
      return;
    }
    const buffer = crypto.randomBytes(Math.min(chunkSize, size - sent));
    res.write(buffer);
    sent += buffer.length;
    setImmediate(sendChunk);
  };
  
  sendChunk();
});

// 2. Upload Endpoint
// Accepts large POST requests and discards data immediately
app.post('/upload', express.raw({ limit: '100mb', type: '*/*' }), (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send({ received: req.body.length });
});

// 3. Ping Endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Velocity Speed Test Backend running on port ${PORT}`);
});
