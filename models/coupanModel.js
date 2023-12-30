const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true, 
    },
    discountAmount: { 
        type: Number,
        required: true, 
    },
    amountDiscounted: { 
        type: Number,
        default: 0, 
    },
    minPurchaseAmount: { 
        type: Number,
        required: true, 
    },
    maxUses: {
        type: Number,
        default: null,
    },
    startDate: {
        type: Date,
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
    usedCount: {
        type: Number,
        default: 0 ,
    },
    status : {
        type : Number, 
        default : true
    },
    usersApplied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
