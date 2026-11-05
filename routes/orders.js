var express = require('express');
var router = express.Router();

const orderSchema = require('../models/order.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');

/* GET orders listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;