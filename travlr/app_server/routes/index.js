'use strict';

const express = require('express');
const travelerController = require('../controllers/travel');

const router = express.Router();

router.get('/travel', travelerController.travel);

router.get('/account', (_req, res) => res.render('account', {title: 'Account - Travlr Getaways'}));
router.get('/itinerary', (_req, res) => res.render('itinerary', {title: 'My Itinerary - Travlr Getaways'}));
module.exports = router;
