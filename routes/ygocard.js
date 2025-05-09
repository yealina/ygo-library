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

/**
 * Returns yugioh card details by its id
 *
 * @api {GET} /ygocard/:id
 * @apiParam {string} id Card unique ID
 *
 * @apiExample localhost:8888/ygocard/1234
 */

router.get('/:id', async(req, res) => {
    try{
        const{id} = req.params;

        if(!id) {
            return res.status(400).json({
                error: 'Missing the required path parameter: id'
            });
        }
        
        const cardData = await api.id(id);

        if(!cardData || cardData.length === 0) {
            return res.status(404).json({
                error: 'Card not found'
            });
        }
        
        await db.insert('SearchHistorySelection', {id});
        res.json(cardData);
    }
    catch(err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

export default router;