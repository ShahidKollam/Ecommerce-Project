const Wishlist = require('../models/wishlistModel')

const addWishlist = async(req,res)=>{
        try {
            const { product_id } = req.body;
    
            const existingItem = await Wishlist.findOne({ user_id: req.session.user, product_id: product_id });
    
            if (existingItem) {
                return res.status(400).json({ error: 'Item already in the wishlist' });
            }
    
            const newWishlist = new Wishlist({
                user_id: req.session.user, 
                product_id: product_id,
            });
    
            const item = await newWishlist.save();
            res.status(200).json({ message: 'Item added to wishlist successfully' });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
}

const loadWishlist = async(req,res)=>{
    try {
        const user = req.session.name
        const wishlist = await Wishlist.find()
        .populate({
            path : 'product_id',
            model : 'Product',
            populate : {
                path : 'category',
                model : 'Category'
            }
        })

        const imageUrl = [];
        for (const item of wishlist) {
             if (item.product_id && item.product_id.image) {
                const images = item.product_id.image.map(image => {
                     return `/product-images/${image.filename}`;
                });
                imageUrl.push(images);
            }
        }

        res.render('wishlist',{
            user,
            order: wishlist,
            imageUrl
        })

    } catch (error) {
        console.log(error.message);
        res.json({error})
    }
}

const remove = async (req, res) => {
    try {
        const { product_id } = req.body; 
        const removedItem = await Wishlist.findOneAndRemove(product_id);
        if (removedItem) {
            res.status(200).json({ message: 'Item removed from wishlist' });
        } else {
            res.status(404).json({ error: 'Item not found in the wishlist' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    addWishlist,
    loadWishlist,
    remove
}