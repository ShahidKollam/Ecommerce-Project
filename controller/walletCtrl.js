const Wallet = require('../models/walletModel')
const Razorpay = require('razorpay')
const crypto = require('crypto');
const Order = require('../models/orderModel')
const Cart_item = require("../models/cartModel")
const mongoose = require('mongoose');

const loadWallet = async(req,res)=>{
    try {
        const id = req.session.user
        let walletData = await Wallet.findOne({user_id:id});
        
        if(!walletData){
            walletData = new Wallet({ user_id:id });
            await walletData.save();
        }
        //console.log(walletData);

        walletData = await Wallet.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(id) } }, 
            { $unwind: '$transactions' }, // Flatten the transactions array
            { $sort: { 'transactions.date': -1 } }, 
            {
                $group: {
                    _id: '$_id',
                    user_id: { $first: '$user_id' },
                    walletAmount: { $first: '$walletAmount' },
                    transactions: { $push: '$transactions' }, // Reassemble the transactions array
                },
            },
        ]);
        
        if (walletData.length > 0) {
            res.render('wallet', {
                user: req.session.name,
                walletData: {
                    walletAmount: walletData[0].walletAmount || 0,
                    transactions: walletData[0].transactions,
                },
            });
        } else {
            console.log('Wallet data not found for user ID:', id);
            res.render('wallet', {
                user: req.session.name,
                walletData: {
                    walletAmount: 0,
                    transactions: [],
                },
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const top_up = async(req,res)=>{
    try {
        const amount = req.body.amount
        const userId = req.session.user
        const id = req.query
        console.log(amount);
        const result = await Wallet.findOneAndUpdate(
            { user_id: userId },
            {
                $inc: { walletAmount: amount },
                $push: {
                    transactions: {
                        type: 'Credit',
                        amount: amount,
                        date: new Date(),
                    },
                },
            }
        );
        console.log(result.transactions);
        res.redirect('/wallet')
    } catch (error) {
        console.log(error.message);
    }
}

const walletPay = async(req,res)=>{
    try {
        const userId = req.session.user;
        const order_id = req.query.id
        const orderData = await Order.findById({_id:order_id})
        const amount = orderData.totalAmount;

        const result = await Wallet.findOneAndUpdate(
            { user_id: userId, walletAmount: { $gte: amount } },
            {
                $inc: { walletAmount: -amount }, 
                $push: {
                    transactions: {
                        type: 'Debit',
                        amount: amount,
                        date: new Date(),
                    },
                },
            },
            { new: true } 
        );

        if (result) {
            const update = await Order.findOneAndUpdate(
                {_id:order_id},
                {$set:{status:'Placed'}},
                {new:true}
            );   
            const deleteCart = await Cart_item.deleteMany({ user_id: userId });
            res.redirect(`/wallet-success?message=Amount deducted from Wallet&mess1=Order Confirmed.`);
        } else {
            res.redirect('/wallet-success?message=Please Top-up Your Wallet&mess1=Order Not Confirmed due to Insufficient Balance.');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const orderSuccess = async(req,res)=>{
    try {
        const {message,mess1} = req.query
        const user = req.session.name
        res.render('wallet-success',{
            message,
            mess1,
            user
        })
    } catch (error) {
        console.log(error.message);
    }
}

const cancelAndRefund = async (req, res) => {
    try {
        const userId = req.session.user;
        const orderId = req.query.id;

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: 'Cancelled' } },
            { new: true }
        );

        if (!updatedOrder) {
            console.log('Failed to update order status');
        }

        const refundAmount = updatedOrder.totalAmount;

        const walletUpdate = await Wallet.findOneAndUpdate(
            { user_id: userId },
            {
                $inc: { walletAmount: refundAmount },
                $push: {
                    transactions: {
                        type: 'Refund Credit',
                        amount: refundAmount,
                        date: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (walletUpdate) {
            console.log('Refund successful');
            res.json({success:true})
        } else {
            console.log('Failed to update wallet');
            res.json({error:true})
        }
        
    } catch (error) { 
        console.error('Error in cancelAndRefund:', error.message);
        return res.redirect('/error-page');
    }
};

module.exports = {
    loadWallet,
    top_up,
    walletPay,
    cancelAndRefund,
    orderSuccess
}