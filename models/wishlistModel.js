const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },

  addedAt: {
    type: Date,
    default: Date.now,
  },
  
});

const WishlistItem = mongoose.model('Wishlist', wishlistSchema);

module.exports = WishlistItem;
