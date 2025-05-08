import express from 'express';

import db from './services/db.js';

import history from './routes/history.js';
import ygocard from './routes/ygocard.js';


const PORT = 8888;
const app = express();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Yu-Gi-Oh! Card Finder App');
});

// Router setup
// To test with Thunder Client... 
//      GET http://localhost:8888/history?type=keywords
//      GET http://localhost:8888/history?type=selections
app.use('/history', history);

// Example: 
//      GET http://localhost:8888/ygocards/keyword=Baby
app.use('/ygocard', ygocard);


// Start server + connect to MongoDB
// start server command: npm start
const server = app.listen(PORT, async () => {
  await db.connect();
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// Shutdown process. Close mongo db connection and server
const shutdown = async () => {
  await db.close();
  server.close(() => {
    console.log('Server shutdown.');
    process.exit(0);
  });
};

// SIGINT - manual interruption (ex: ctrl + c on Mac)
// SIGTERM - polite terminate (ex: docker shutting down the process)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
