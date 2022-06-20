const express = require('express');

const loginController = require('../controllers/login');

const router = express.Router();

router.get('/authenticate', loginController.getLogin);

router.post('/login-attempt', loginController.postLogin);

module.exports = router;
