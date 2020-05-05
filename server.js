// Import packages
const express = require('express');
const path = require('path');

// Init express
const app = express();

// Handles JSON
app.use(express.json());

// Set static folder
const publicDirectory = path.join(__dirname, 'public');
app.use(express.static(publicDirectory));

// ISS API routes
app.use('/iss', require('./routes/api/iss'));

// Starts server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));