const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  orderDate: {
     type: Date,
     default: Date.now 
  },

  orderID: {
    type: String,
    required: true
  },

  totalAmount: { 
    type: Number, 
    required: true 
  }, 

  discount:{
    type: Number,
    default: 0
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  
  paymentMethod: {
    type: String,
    enum: ['RazorPay', 'PayPal', 'Cash On Delivery','Wallet'],
    required: true
  },

  status: { 
    type: String, 
    enum: ["Pending", "Shipped", "Delivered", 'Cancelled', 'Returned','Placed'],
    default: 'Pending' 
  },

  orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        image: { type: Array },
        quantity: { type: Number },
        pricePerOrdrItem: { type: Number },
      }
    ]
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
