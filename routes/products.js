var express = require('express');
var router = express.Router();

const productSchema = require('../models/product.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');

/* GET products listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;