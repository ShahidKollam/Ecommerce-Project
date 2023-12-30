const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, 
  },

  walletAmount: {
        type: Number,
        default: 0,
  },

  transactions: [
    {
      type: {
        type: String, 
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});


module.exports = mongoose.model('Wallet', walletSchema);
