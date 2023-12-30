const express = require('express')
const admin_route = express()
const session = require('express-session')

const categoryController = require('../controller/categoryCtrl')
const productController = require('../controller/productCtrl')
const adminController = require('../controller/adminCtrl')
const dashController = require('../controller/dashCtrl')
const coupanCtrl = require('../controller/coupanCtrl')
const bannerCtrl  = require('../controller/bannerCtrl')
const offerCtrl = require('../controller/offerCtrl')
const config = require('../config/configure')
const upload = require('../middlewares/multer')
const auth = require('../middlewares/adminAuth')

admin_route.use(session({ secret:config.adminSession, resave:false, saveUninitialized:true }));
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin') 

admin_route.post('/admin',auth.isLogout,adminController.verifyLogin)
admin_route.post('/admin/add-user',auth.isLogin,adminController.saveUser)
admin_route.post('/admin/block-user',auth.isLogin,adminController.blockUser)
admin_route.post('/admin/add-category',auth.isLogin,categoryController.addCategory)
admin_route.post('/admin/edit-category',auth.isLogin,categoryController.updateCategory)
admin_route.post('/admin/delete-category',categoryController.deleteCategory)
admin_route.post('/admin/add-product',upload.upload.array('product_image',20),productController.saveProduct)
admin_route.post('/admin/edit-product',upload.upload.array('product_image',20),productController.updateProduct)
admin_route.post('/admin/block-product',productController.blockProduct)
 
admin_route.get('/admin',auth.isLogout,adminController.loadLogin)
admin_route.get('/admin/home',auth.isLogin,adminController.loadHome)
admin_route.get('/admin/logout',auth.isLogin,adminController.logout)
admin_route.get('/admin/get-user',auth.isLogin,adminController.getUser)
admin_route.get('/admin/add-user',auth.isLogin,adminController.addUser)

admin_route.get('/admin/category',auth.isLogin,categoryController.loadCategory)
admin_route.get('/admin/edit-category',auth.isLogin,categoryController.editCategory)
admin_route.get('/admin/products',productController.loadProducts)
admin_route.get('/admin/add-product',productController.addProducts)
admin_route.get('/admin/edit-product',productController.editProducts)

admin_route.get('/admin/chart',adminController.chart)

// Order
admin_route.get('/admin/orders',adminController.showOrder)
admin_route.get('/admin/order-details',adminController.orderDetails)
admin_route.post('/admin/update-order-status',adminController.updateStatus)

//sales
admin_route.get('/admin/sales',dashController.salesReport)
// admin_route.get('/admin/export',dashController.exportPDF)
admin_route.post('/admin/getOrdersByDate',dashController.filter)

// coupan
admin_route.get('/coupan',coupanCtrl.loadAddCoupon)
admin_route.get('/add-coupan',coupanCtrl.addCoupon)
admin_route.post('/add-coupan',coupanCtrl.saveCoupon)
admin_route.delete('/couponDelete/:couponId',coupanCtrl.deleteCoupon)

// offer 
admin_route.get('/product-offer',offerCtrl.productOffer)
admin_route.post('/product-discount',offerCtrl.updateOfferProduct)
admin_route.post('/category-offer',offerCtrl.updateOfferCat)
admin_route.get('/category-offer',offerCtrl.categoryOffer)
admin_route.get('/referal-offer',offerCtrl.referalOffer)

// banner
admin_route.get('/banner',bannerCtrl.loadBanner)
admin_route.get('/banner/add',bannerCtrl.addBanner)
admin_route.get('/banner/edit',bannerCtrl.editBanner)
admin_route.post('/banner/add',upload.upload.single('banner-image'),bannerCtrl.saveBanner)
admin_route.post('/banner/edit',upload.upload.single('banner-image'),bannerCtrl.updateBanner)
admin_route.post('/banner/block',bannerCtrl.blockBanner)


module.exports = admin_route