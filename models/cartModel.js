const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      image: {
        type: Array,
        required: true
      },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    });

    
module.exports =  mongoose.model('CartItem', cartItemSchema);