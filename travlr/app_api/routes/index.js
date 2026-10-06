'use strict';

const express = require('express');
const tripsController = require('../controllers/trips');

const router = express.Router();

router.get('/trips', tripsController.tripsList);
router.get('/trips/:tripCode', tripsController.tripsFindByCode);
router.post('/trips', tripsController.tripsAdd);
router.put('/trips/:tripCode', tripsController.tripsUpdate);
router.delete('/trips/:tripCode', tripsController.tripsDelete);

module.exports = router;
