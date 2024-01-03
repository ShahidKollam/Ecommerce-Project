const express = require('express');
const session = require('express-session')
const user_route = express();

const config = require('../config/configure')
const auth = require('../middlewares/userAuth')
const userController = require('../controller/userCtrl')
const cartController = require('../controller/cartCtrl')
const paymentController  = require('../controller/paymenCtrl')
const checkoutCtrl  = require('../controller/checkoutCtrl') 
const wishlistCtrl  = require('../controller/wishlistCtrl') 
const profileCtrl = require('../controller/profileCtrl')
const coupanCtrl = require('../controller/coupanCtrl')
const walletCtrl = require('../controller/walletCtrl')
const orderCtrl = require('../controller/orderCtrl')

user_route.use(session({ secret:config.userSession, resave:false, saveUninitialized:true }));
user_route.use(express.static('public'));

const flash = require('connect-flash')
user_route.use(flash());

user_route.set('view engine', 'ejs');
user_route.set('views','./views/users')      

user_route.get('/',auth.isLogout,userController.loadLandPage)
user_route.get('/login',auth.isLogout,userController.loginPage)
user_route.get('/logout',auth.isLogin,userController.logout)
//user_route.get('/verify-otp',userController.otpPage)
user_route.get('/users/home',auth.isLogin,userController.loadHome)
user_route.get('/register-page',auth.isLogout,userController.loadRegister)
//user_route.get('/resend-otp',userController.otpPage)
user_route.get('/users/search',userController.searchLoad) 
user_route.get('/users/filter',userController.loadFilter) 
user_route.get('/users/item-single',userController.singleItem) 

user_route.post('/login',userController.verifyLogin)
user_route.post('/register',userController.insertUser)
user_route.post('/verify-otp',userController.verifyOtp)
user_route.post('/resend-otp',userController.resendOTP)
user_route.post('/users/search',userController.search)
user_route.post('/users/filter',userController.filter) 

user_route.get('/users/edit-user',userController.editUser)
user_route.post('/users/edit-user',userController.updateUser)

user_route.get('/shop',userController.productList)


// forget password
user_route.get('/forget-password',userController.forgetLoad) 
user_route.post('/forget-password',userController.forgetVerify) 
user_route.get('/forgetPassword',userController.forgetPasswordLoad)
user_route.post('/reset-password',userController.resetPassword)

// Cart 
user_route.get('/add-to-cart',cartController.load_cart)
user_route.post('/add-to-cart',cartController.add_cart)
user_route.post('/cart-delete',cartController.delete_cart)
user_route.post('/cart-update',cartController.update_cart)

// Address & user-profile
user_route.get('/users/profile',profileCtrl.userProfile) 
user_route.get('/address',profileCtrl.new_address)
user_route.post('/address',profileCtrl.add_address)
user_route.get('/address/edit',profileCtrl.editAddress)
user_route.post('/address/edit',profileCtrl.updateAddress)
user_route.post('/address/delete/:addressId',profileCtrl.deleteAddress)
user_route.get('/changePassword',profileCtrl.changePassword)
user_route.post('/changePassword',profileCtrl.updatePassword)


// checkout
user_route.get('/checkout',checkoutCtrl.loadCheckout)
user_route.post('/place-order',checkoutCtrl.placeOrder)
user_route.get('/order-success',checkoutCtrl.orderSuccess)
user_route.post('/verify-coupon',coupanCtrl.verifyCoupon)
user_route.post('/get-coupon',coupanCtrl.getCoupon)

// order 
user_route.get('/order-history',orderCtrl.orderHistory)
user_route.post('/order-cancel',orderCtrl.cancelOrder)
user_route.post('/order-return',orderCtrl.returnOrder)
user_route.get('/order-details',orderCtrl.orderDetails)
// invoice download
user_route.get('/download/invoice/:order_id',orderCtrl.invoice)

// payment
user_route.get('/razorpay-payment',paymentController.loadPayment)
user_route.post('/razorpay',paymentController.createOrder)
user_route.post('/verify-payment',paymentController.verifyPayment)
user_route.get('/success-payment',paymentController.paymentSuccess)

//wallet
user_route.get('/wallet',walletCtrl.loadWallet)
user_route.post('/top-up',walletCtrl.top_up)
user_route.get('/wallet-pay',walletCtrl.walletPay)
user_route.get('/wallet-success',walletCtrl.orderSuccess)
user_route.get('/cancel-refund',walletCtrl.cancelAndRefund)

// wishlist
user_route.post('/add-wishlist',wishlistCtrl.addWishlist)
user_route.get('/wishlist',wishlistCtrl.loadWishlist)
user_route.post('/remove-item',wishlistCtrl.remove)

// referal
user_route.get('/referral',userController.referralPage)

module.exports = user_route            





// user_route.get('/verify',userController.verifyMail)    // know not using email link sent
