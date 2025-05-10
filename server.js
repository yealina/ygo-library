import express from 'express';

import db from './services/db.js';

import history from './routes/history.js';
import ygocard from './routes/ygocard.js';

const PORT = 8888;
const app = express();


app.get('/', (req, res) => {
  res.send('Welcome to the Yu-Gi-Oh! Card Finder App');
});


app.use('/history', history);
app.use('/ygocard', ygocard);

let server;
const start = async () => {
  try {
    await db.connect(); 
    server = app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};
start();


const shutdown = async () => {
  await db.close();
  if (server) {
    server.close(() => {
      console.log('Server shutdown.');
      process.exit(0);
    });
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
