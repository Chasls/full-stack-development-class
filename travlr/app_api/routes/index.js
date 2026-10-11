'use strict';

const express = require('express');
const tripsController = require('../controllers/trips');

const {requireAdmin, requireUser} = require('../security');
const auth = require('../controllers/authentication');
const router = express.Router();
router.post('/register', auth.register);
router.post('/login', auth.login);

router.get('/trips', tripsController.tripsList);
router.get('/trips/:tripCode', tripsController.tripsFindByCode);
router.post('/trips', requireAdmin, tripsController.tripsAdd);
router.put('/trips/:tripCode', requireAdmin, tripsController.tripsUpdate);
router.delete('/trips/:tripCode', requireAdmin, tripsController.tripsDelete);

const reservations = require('../controllers/reservations');
const users = require('../controllers/users');
router.get('/reservations', requireUser, reservations.list);
router.post('/reservations', requireUser, reservations.add);
router.delete('/reservations/:id', requireUser, reservations.cancel);
router.get('/users', requireAdmin, users.list);
router.put('/users/:id', requireAdmin, users.update);
router.delete('/users/:id', requireAdmin, users.remove);
module.exports = router;
