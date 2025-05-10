import express from 'express';
import db from '../services/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const validTypes = ['keywords', 'selections']; //localhost:8888/history?type=selections or localhost:8888/history?type=keywords

    if (!type) {
      return res.status(400).json({
        error: 'Missing required query parameter: type'
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type "${type}". Must be either "keywords" or "selections".`
      });
    }

    const collection = type === 'keywords'
      ? 'SearchHistoryKeyword'
      : 'SearchHistorySelection';

    const cursor = await db.find(collection);
    const records = await cursor.toArray();

    // Remove _id from the response
    const results = records.map(({ _id, ...rest }) => rest);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
