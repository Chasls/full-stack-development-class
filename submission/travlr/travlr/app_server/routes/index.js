'use strict';

const express = require('express');
const travelerController = require('../controllers/travel');

const router = express.Router();

router.get('/travel', travelerController.travel);

module.exports = router;
