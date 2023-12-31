const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const path = require('path');
const fs = require("fs")

const loadProducts = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const {message} = req.query
        const productData = await Product.find()
        .populate("category")
        .sort({_id: -1})

        const imageUrls = [] 
        if (productData) {
            for (const product of productData){
                const images = product.image.map(image => {
                return `/product-images/${image.filename}`;
            });
            imageUrls.push(images)
          }   
        }

        res.render('products-list',{
            adminEmail,
            adminName,
            message,
            imageUrls:imageUrls,
            product:productData
        })
    } catch (error) {
        console.log(error.message);
    }
}

const addProducts = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const categoryData = await Category.find()
        
        res.render('add-product',{
            adminName,
            adminEmail,
            category:categoryData
        })
    } catch (error) {
        console.log(error.message);
    }
} 

const saveProduct = async(req,res)=>{
    try {
        console.log(req.body);
        console.log(req.files);
        const description = req.body.product_description
        const productData = await Product.findOne({ description: description });
        if(productData){
            console.log("error");
            res.json({error:"Product already exist"})
        }else{ 
        const product = new Product({
            name : req.body.product_name,
            price : req.body.product_price,
            image : req.files, 
            quantity : req.body.product_stock,
            category : req.body.product_category,
            description : req.body.product_description,  
            is_blocked: false 
        })
        const productData = await product.save()
        console.log(productData);
        res.json({success: true})
    }
    } catch (error) {
        console.log(error.message);
    }
}

const editProducts = async(req,res)=>{
            try {
                const adminName = req.session.adminName
                const adminEmail = req.session.adminEmail
                const id = req.query.id
                const categoryData = await Category.find()
                const productData = await Product.findById({ _id: id }).populate("category")

                const imageUrls = [];
                if (productData) {
                    const images = productData.image.map((image) => {
                        return `/product-images/${image.filename}`;
                    });
                    imageUrls.push(images);
                }

                res.render("edit-product", {
                    category: categoryData,
                    product: productData,
                    adminEmail,
                    adminName,
                    imageUrls,
                });
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
        }
}

const updateProduct = async (req, res) => {  
    try {
        const id = req.query.id;
        console.log("body",req.body.deletedImages);
        console.log(req.files);
        let updatedData = {};

        const existingImages = await Product.findById(id).select('image');
        updatedData.image = existingImages.image || [];

        if (req.files && req.files.length > 0) {
        updatedData.image = updatedData.image.concat(req.files);
        }

        const deletedImages = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];

        if (deletedImages.length > 0) {
        updatedData.image = updatedData.image.filter(image => {
            const filename = image.filename || image.originalname; 
            return !deletedImages.includes(filename);
        }); 
        }
        //console.log(updatedData);
        updatedData.name = req.body.product_name;
        updatedData.price = req.body.product_price;
        updatedData.quantity = req.body.product_stock;
        updatedData.category = req.body.product_category;
        updatedData.description = req.body.product_description;
        updatedData.is_blocked = false;

        const productData = await Product.findByIdAndUpdate(id, updatedData, { new: true });
        res.json({success: true})
        //res.redirect(`/admin/products?message=Product Edited`);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        }
}    

const blockProduct = async(req,res)=>{
    try {
        const action = req.body.action
        const id = req.query.id
        let is_blocked;
        if (action === 'blocked') {
            is_blocked = true
        } else {
            is_blocked = false
        }

        if (is_blocked !== undefined) {
            const blockInfo = await Product.updateOne({_id:id},{$set:{is_blocked}})
            res.redirect(`/admin/products?id=${id}&is_blocked=${is_blocked}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadProducts,
    addProducts,
    saveProduct,
    editProducts,
    updateProduct,
    blockProduct
}