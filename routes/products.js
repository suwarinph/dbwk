var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');
const productSchema = require('../models/product.model');
const orderSchema = require('../models/order.model');

router.use(tokenMiddleware)

/* GET products listing. */
// GET /api/v1/products
router.get('/',  async function(req,res,next){
  try{
    let products = await productSchema.find({storeId: req.auth.userId, isDeleted: false});
    return res.status(200).json({status: 200,message: 'success',data: products});
 }

  catch(error) { console.error(error);  res.status(500).json({status:500,message:'Server error',data:null}); 

 }
});

// POST /api/v1/products
router.post('/', async function(req, res, next) {
    try {
        let { name, price, stock } = req.body;

        if (!name || typeof price !== 'number' || price < 0 || !Number.isInteger(stock) || stock < 0) {

            return res.status(400).json({ status: 400, message: 'Invalid product data', data: null});
        }

        let product = new productSchema({name,price,stock,storeId: req.auth.userId});

        await product.save();
        return res.status(201).json({status: 201,message: 'Product created successfully',data: product});

    } 
        catch(error) {console.error(error);return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});

// GET /api/v1/products/:id
router.get('/:id', async function(req, res, next) {
    try {
        let { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({status: 400, message: 'Invalid product ID', data: null});
        }

        let product = await productSchema.findOne({_id: id, storeId: req.auth.userId, isDeleted: false});

        if (!product) {
            return res.status(400).json({status: 400, message: 'Product not found', data: null});
        }

        return res.status(200).json({status: 200, message: 'success', data: product});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});


// PUT /api/v1/products/:id
router.put('/:id', async function(req, res, next) {
    try {
        let { id } = req.params;
        let { name, price, stock } = req.body;

        const updateData = {
            name: name,
            price: price,
            stock: stock
        }

        let product = await productSchema.findOneAndUpdate(
            {_id: id, storeId: req.auth.userId, isDeleted: false},
            updateData,
            {new: true}
        );

        if (!product) {
            return res.status(400).json({status: 400, message: 'Product not found', data: null});
        }

        return res.status(200).json({status: 200, message: 'Product updated successfully', data: product});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});


// DELETE /api/v1/products/:id
router.delete('/:id', async function(req, res, next) {
    try {
        let { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({status: 400, message: 'Invalid product ID', data: null});
        }

        let product = await productSchema.findOneAndUpdate(
            {_id: id, storeId: req.auth.userId, isDeleted: false},
            {isDeleted: true},
            {new: true}
        );

        if (!product) {
            return res.status(400).json({status: 400, message: 'Product not found', data: null});
        }

        return res.status(200).json({status: 200, message: 'Product deleted successfully', data: product});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});


// GET /api/v1/products/:id/orders
router.get('/:id/orders', async function(req, res, next) {
    try {
        let { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({status: 400, message: 'Invalid product ID', data: null});
        }

        let product = await productSchema.findOne({_id: id, storeId: req.auth.userId});

        if (!product) {
            return res.status(400).json({status: 400, message: 'Product not found', data: null});
        }

        let orders = await orderSchema.find({productId: id, storeId: req.auth.userId}).populate('productId', 'name isDeleted');

        return res.status(200).json({status: 200, message: 'success', data: orders});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});


// POST /api/v1/products/:id/orders
router.post('/:id/orders', async function(req, res, next) {
    try {
        let { id } = req.params;
        let { quantity } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({status: 400, message: 'Invalid product ID', data: null});
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({status: 400, message: 'Invalid quantity', data: null});
        }

        let product = await productSchema.findOne({_id: id, storeId: req.auth.userId, isDeleted: false});

        if (!product) {
            return res.status(400).json({status: 400, message: 'Product not found', data: null});
        }

        if (quantity > product.stock) {
            return res.status(400).json({status: 400, message: 'Insufficient stock', data: null});
        }

        let updatedProduct = await productSchema.findOneAndUpdate(
            {_id: id, storeId: req.auth.userId, isDeleted: false, stock: {$gte: quantity}},
            {$inc: {stock: -quantity}},
            {new: true}
        );

        if (!updatedProduct) {
            return res.status(400).json({status: 400, message: 'Insufficient stock', data: null});
        }

        let order = new orderSchema({productId: id, storeId: req.auth.userId, quantity});

        try {
            await order.save();
        }
        catch(error) {
            await productSchema.updateOne({_id: id}, {$inc: {stock: quantity}});
            throw error;
        }

        return res.status(201).json({status: 201, message: 'Order created successfully', data: order});
    }

    catch(error) {
        console.error(error);
        return res.status(500).json({status: 500, message: 'Server error', data: null});
    }
});

module.exports = router;