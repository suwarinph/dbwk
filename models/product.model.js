const mongoose = require('mongoose');
const {  Schema } = mongoose;

const productSchema = new mongoose.Schema({

    name: {
        type: String,
    required: true,
        trim: true
    },
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0  
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Product', productSchema);