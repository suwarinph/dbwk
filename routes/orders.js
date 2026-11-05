var express = require('express');
var router = express.Router();

const orderSchema = require('../models/order.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');

/* GET orders listing. */
// GET /api/v1/orders
router.get('/', tokenMiddleware, async function(req, res, next) {
    try {
        let orders = await orderSchema.find({storeId: req.auth.userId}).populate('productId', 'name isDeleted');

        return res.status(200).json({status: 200, message: 'success', data: orders});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});
module.exports = router;