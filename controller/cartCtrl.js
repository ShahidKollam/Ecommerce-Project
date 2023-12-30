const Cart_item = require("../models/cartModel")
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const add_cart = async(req,res)=>{
    try {
        const user_id = req.session.user
        const product_id = req.body.product_id
        const item = await Cart_item.findOne({product_id:product_id})
        const productData = await Product.findById({_id:product_id})

        if(item){
            res.redirect(`/shop?message=This product already added`);
        }else{
            const cartItem = new Cart_item({
                name:productData.name,
                image:productData.image,
                quantity:1,
                product_id:product_id,
                user_id:user_id
            })
            const cartData = await cartItem.save()

            req.flash('success', 'Product added to cart Successfully!');
            res.redirect(`/add-to-cart`)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const load_cart = async(req,res)=>{
    try {
        const user = req.session.name
        const cart_items = await Cart_item.find().populate("product_id")
      
        const successMessage = req.flash('success');
            const imageUrl = []
            for ( const item of cart_items ){
                    const images = item.image.map(image=>{
                    return `/product-images/${image.filename}`;
                })
                imageUrl.push(images)
            }
            if(cart_items){
                res.render('cart',{
                    user,
                    imageUrl:imageUrl,
                    cart:cart_items,
                    success:successMessage
                })
            }
    } catch (error) {
        console.log(error.message);
    }
}

const delete_cart = async(req,res)=>{
    try {
        const cart_id = req.body.cart_item
        console.log(cart_id);
        const delet = await Cart_item.findByIdAndDelete({_id:cart_id})
        res.status(200).json({ message: 'Item removed successfully' });

        //res.redirect('/add-to-cart')
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const update_cart = async (req, res) => {
    try {
        const { cartItemId, newQuantity } = req.body; 

        const cartItem = await Cart_item.findById(cartItemId).populate('product_id');

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        const availableQuantity = cartItem.product_id.quantity;

        if (newQuantity > availableQuantity) {
            return res.status(400).json({
                error: 'Insufficient quantity available',
                availableQuantity: availableQuantity,
            });
        }

        const updatedData = await Cart_item.findByIdAndUpdate(
            cartItemId,
            { quantity: newQuantity },
            { new: true }
        );

        if (updatedData) {
            res.redirect('/add-to-cart');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    add_cart,
    load_cart,
    delete_cart,
    update_cart
}