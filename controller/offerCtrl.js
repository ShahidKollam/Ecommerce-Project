const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const productOffer = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const {message } = req.query
        const productData = await Product.find().populate("category")

        const imageUrls = [] 
        if (productData) {
            for (const product of productData){
                const images = product.image.map(image => {
                return `/product-images/${image.filename}`;
            });
            imageUrls.push(images)
          }   
        }

        res.render('offer-product',{
            adminEmail,
            adminName,
            message,
            imageUrls:imageUrls,
            product:productData
        })
    } catch (error) {
        console.log(error.message);
    }
};


const updateOfferProduct = async(req,res)=>{
    try {
        console.log(req.body);
        const { offer, _id } = req.body
        const product = await Product.findByIdAndUpdate({_id:_id},{$set:{
            offer: offer
        }});

        console.log(product);
        if (product) {
            res.json({ success: true, message: "Offer Updated" });
        } else {
            res.json({ success: false, message: "Error in updating" });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'Internal Server Error' });
    }
}

const categoryOffer = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const categoryData = await Category.find()
        const { message } = req.query

        res.render('offer-category',{
            adminEmail,
            adminName,
            message,
            category:categoryData

        })
    } catch (error) {
        console.log(error.message);
    }
};

const updateOfferCat = async(req,res)=>{
    try {
        console.log(req.body);
        const { offer, id } = req.body
        const category = await Category.findByIdAndUpdate({_id:id},{$set:{
            CatOffer: offer
        }});

        res.redirect('/category-offer?message=Offer Updated')
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'Internal Server Error' });
    }
}


const referalOffer = async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    productOffer,
    categoryOffer,
    referalOffer,
    updateOfferProduct,
    updateOfferCat
}