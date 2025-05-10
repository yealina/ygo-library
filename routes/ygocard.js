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
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Missing required query parameter: name' });
    }

    const ygoCards = await api.keyword('fname', name);
    const result = minimalizeCardResponse(ygoCards);

    // Store unique search by name 
    const existing = await db.find('SearchHistoryKeyword', { name });
    if (await existing?.hasNext?.() === false) {
      await db.insert('SearchHistoryKeyword', { name });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Missing the required path parameter: id',
      });
    }

    const cardData = await api.UID(id);

    if (!cardData || (Array.isArray(cardData) && cardData.length === 0)) {
      return res.status(404).json({
        error: 'Card not found',
      });
    }

    // Save search history
    await db.update('SearchHistorySelection', { id }, { id });


    // Respond with card data
    res.json(cardData);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Internal server error',
    });
  }
});


export default router;