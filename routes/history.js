import express from 'express';

import db from '../services/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const { type } = req.query;
        const validTypes = ['keywords', 'selections'];

        if (!type) {
            return res.status(400).json({ 
              error: 'Missing required query parameter: type' 
            });
        } else if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                error: `Invalid type "${type}". Must be either: "keywords" or "selections".` 
              });
        }

        const collection = type === 'keywords' ? 'SearchHistoryKeyword' : 'SearchHistorySelection';
        const cursor = await db.find(collection);
        const records = await cursor.toArray();
        const results = records.map(({ _id, ...rest }) => rest);

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;