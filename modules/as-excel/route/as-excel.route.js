const express = require('express');
const router = express.Router();
const loginCtrl = require('../controller/login.controller.server');

router
    .route('/login')
    .post(loginCtrl.loginAuthenticate);


module.exports = router;
