const express = require('express');
const router = express.Router();
const passport = require('passport');
const authorization = require('../../../config/authorization.config');
const loginCtrl = require('../controller/login.controller.server');
const asExcelCtrl = require('../controller/as-excel.controller');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './modules/as-excel/files/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname?.toLowerCase());
    }
});

const uploadfiles = multer({ storage });

router
    .route('/login')
    .post(loginCtrl.loginAuthenticate);

router
    .route('/upload')
    .post(passport.authenticate('jwt', {
        session: false
    }), authorization.authorize('Admin'), uploadfiles.any(), (req, res) => res.status(200).json('ok'));


router
    .route('/delete-file')
    .post(passport.authenticate('jwt', {
        session: false
    }), authorization.authorize('Admin'), asExcelCtrl.deleteFileFromServier);


router
    .route('/manipulate')
    .get(passport.authenticate('jwt', {
        session: false
    }), authorization.authorize('Admin'), asExcelCtrl.manipulateFiles);


module.exports = router;
