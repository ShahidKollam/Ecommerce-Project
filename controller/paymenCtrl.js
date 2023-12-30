const Razorpay = require('razorpay')
const crypto = require('crypto');
const Order = require('../models/orderModel')
const Cart_item = require("../models/cartModel")

var instance = new Razorpay({ 
    key_id: process.env.RazorpayId, 
    key_secret: process.env.RazorpayKeySecret
 })

const loadPayment = async(req,res)=>{
    try {
        const id = req.query.id
        const orderData = await Order.findById({_id:id})
        const user = req.session.name
        res.render('razorPay',{
            user,
            orderData
        })
    } catch (error) {
        console.log(error.message);
    }
}

const createOrder = async (req, res) => {
    try {
        const {id, amount} = req.body
        
        const orderData = await Order.findById(id);

        const options = {
            amount: amount * 100, // amount in paise (100 paise = 1 INR)
            currency: 'INR',
            receipt: 'order_receipt_123',
        };

        const order = await instance.orders.create(options);
        console.log(order); 
        res.json(order);

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const verifyPayment = async(req,res)=>{
    try {
        const { paymentId, orderId, signature, id } = req.body;
        const secret = process.env.RazorpayKeySecret;
        const generated_signature = crypto.createHmac('sha256', secret)
            .update(orderId + "|" + paymentId)
            .digest('hex');
        if (generated_signature === signature) {
            const update = await Order.findOneAndUpdate(
                {_id:id},
                {$set:{status:'Placed'}},
                {new:true}
            );   
            res.status(200).json({ success: true, message: 'Payment verification successful' });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const paymentSuccess = async (req, res) => {
    try {
        const user_id = req.session.user;
        const user = req.session.name;
        const { id } = req.query;
        const orderData = await Order.findById({ _id: id }).populate("shippingAddress");
        const deleteCart = await Cart_item.deleteMany({ user_id: user_id });

        res.render('order-confirmed', {
            user,
            orderData,
            message: 'Placed Successfully'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    loadPayment,
    createOrder,
    verifyPayment,
    paymentSuccess
}