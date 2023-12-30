const Cart_item = require("../models/cartModel")
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const Coupon = require('../models/coupanModel')

function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 90000);
}
const generate_id = async()=>{
    try {
        var prefix = "ORD";
        var randomNumber = generateRandomNumber();
        const customOrderID = `${prefix}${randomNumber}`;
        return customOrderID;
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async(req,res)=>{
    try {
        const user = req.session.name
        const message = req.query
        const address = await Address.find()
        const cartData = await Cart_item.find().populate("product_id")
        const coupon = await Coupon.find()
        res.render('checkout',{
            user,
            message,
            coupon,
            cart:cartData,
            address:address
        })
    } catch (error) { 
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    try {
        const {discount , total, paymentMethod, selectedAddress, orderItems } = req.body
        const user_id = req.session.user;
        const orderID = await generate_id();
        const finalTotal = total - discount

        const order = new Order({
            orderID: orderID,
            user_id: user_id,
            totalAmount: finalTotal,
            orderItems: orderItems,
            paymentMethod: paymentMethod,
            shippingAddress: selectedAddress,
        });

        const orderData = await order.save();
        
        if (orderData) {
            for (const item of orderItems) {
                const productId = item.product;
                const quantity = item.quantity;

                const updateQuantity = await Product.findByIdAndUpdate(productId, {
                    $inc: { quantity: -quantity },
                });
            }
        }

        if (paymentMethod === 'RazorPay') {
            res.redirect(`/razorpay-payment?id=${orderData._id}`);
        } else if (paymentMethod === 'Wallet') {
            res.redirect(`/wallet-pay?id=${orderData._id}`);
        } else if (paymentMethod === 'Cash On Delivery') {
            res.redirect(`/order-success?id=${orderData._id}&message=Successful`);
        }
    } catch (error) {
        console.log(error.message);
    }
};

const orderSuccess = async(req,res)=>{
    try {
        const user = req.session.name
        const user_id = req.session.user
        const message = req.query.message
        const orderId = req.query.id
        const orderData = await Order.findById({_id:orderId})
        .populate("shippingAddress");

        const deleteCart = await Cart_item.deleteMany({ user_id: user_id });
        res.render('order-confirmed',{
            user,
            orderData : orderData,
            message
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    orderSuccess
}