var express = require('express');
var router = express.Router();

const userSchema = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');
const userController = require('../controllers/users.controller');


// PUT /api/v1/users/:id/approve
router.put('/:id/approve',tokenMiddleware,userController.approveUser);


module.exports = router;
