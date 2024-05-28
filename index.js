require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const validUrl = require('valid-url'); // Add this line to use valid-url for URL validation

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URLs
const urlDatabase = {};

// POST /api/shorturl endpoint
app.post('/api/shorturl', async function(req, res) {
  console.log('Request Body:', req.body);  // Log the request body
  const { url } = req.body;

  // Validate the URL
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Dynamically import nanoid
  const { nanoid } = await import('nanoid');

  // Generate a unique short URL identifier
  const shortUrl = nanoid(7);

  // Store the URL in the database
  urlDatabase[shortUrl] = url;

  // Return the response with original and short URLs
  res.json({ original_url: url, short_url: shortUrl });
});

// GET /api/shorturl/:short_url endpoint
app.get('/api/shorturl/:short_url', function(req, res) {
  const { short_url } = req.params;

  // Find the original URL in the database
  const originalUrl = urlDatabase[short_url];

  // If the short URL is not found, return an error
  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
