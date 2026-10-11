'use strict';

const express = require('express');
const tripsController = require('../controllers/trips');

const {requireAdmin} = require('../security');
const auth = require('../controllers/authentication');
const router = express.Router();
router.post('/register', auth.register);
router.post('/login', auth.login);

router.get('/trips', tripsController.tripsList);
router.get('/trips/:tripCode', tripsController.tripsFindByCode);
router.post('/trips', requireAdmin, tripsController.tripsAdd);
router.put('/trips/:tripCode', requireAdmin, tripsController.tripsUpdate);
router.delete('/trips/:tripCode', requireAdmin, tripsController.tripsDelete);

module.exports = router;
