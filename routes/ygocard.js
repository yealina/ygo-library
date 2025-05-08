import express from 'express';

import * as api from '../services/api.js';
import db from '../services/db.js';

const router = express.Router();

const minimalizeCardResponse = (cards) => {
    return cards.map(card => ({
        display: card.name,
        identifier: card.id
    }));
};


/**
 * returns yugioh card details
 *
 * @api {GET} /ygocard
 * @apiQuery {string} [keyword]
 *      keyword to find card
 *
 * @apiExample localhost:8888/ygocard?keyword=baby
 *
 */
router.get('/', async (req, res) => {
    try {
        const { keyword } = req.query;
        

        if (!keyword) {
            return res.status(400).json({ 
                error: 'Missing required query parameter: keyword' 
            });
        }

        const ygoCards = await api.keyword('fname', keyword);
        const result = minimalizeCardResponse(ygoCards)
        await db.insert('SearchHistoryKeyword', { keyword });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

export default router;