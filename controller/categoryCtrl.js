const Category = require('../models/categoryModel')
const Product = require('../models/productModel')

const loadCategory = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const message = req.query.message
        const categoryData = await Category.find()
        res.render('category',{
            adminName,
            adminEmail,
            category:categoryData,
            message
        })
    } catch (error) {
        console.log(error.message);
    } 
}   

const addCategory = async(req,res)=>{
    try {
        const categoryName = req.body.categoryName
        const upperCaseName = categoryName.toUpperCase()

        const categoryData = await Category.findOne({ name: upperCaseName })
        if (categoryData) {
            res.redirect('/admin/category?message=Category Exist')

        } else {
            const category = new Category({ name:upperCaseName })
            const categoryData = await category.save()
            res.redirect('/admin/category?message=Category Added')
        }
    } catch (error) { 
        console.log(error.message);
    }
}

const editCategory = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const id = req.query.id
        const message = req.query.message
        const categoryData = await Category.findById({_id:id}) 
        res.render('edit-category',{
            adminEmail,
            adminName,
            message,
            category:categoryData
        })
    } catch (error) {
        console.log(error.message);
    }
} 

const updateCategory = async(req,res)=>{
    try {
        const newName = req.body.categoryName
        const upperCaseName = newName.toUpperCase()

        const categoryData = await Category.findOne({ name: upperCaseName })

        if (categoryData) {
            const cat_id = categoryData._id;
            res.redirect(`/admin/edit-category?message=Not updated Category Exist&id=${cat_id}`)
        } else { 

        const update = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{name:upperCaseName}})
        res.redirect('/admin/category?message=Category Updated')
    }
    } catch (error) {
        console.log(error.message);
    }
}

// const deleteCategory = async(req,res)=>{
//     try {

//         const action = req.body.action
//         const category_id = req.query.id
//         let is_blocked;
//         if (action === 'blocked') {
//             is_blocked = true
//         } else {
//             is_blocked = false
//         }

//         if (is_blocked !== undefined) {
//             const update = await Category.findByIdAndUpdate({_id:category_id},{$set:{is_blocked:is_blocked}})
//             res.redirect('/admin/category')
//         }

//     } catch (error) {
//         console.log(error.message);
//     } 
// } 

const deleteCategory = async (req, res) => {
    try {
        const action = req.body.action; 
        const category_id = req.body.id;
        console.log(req.body);
        let is_blocked;

        if (action === 'true') {
            is_blocked = false;
        } else if(action === "false") {
            is_blocked = true;
        }

        if (is_blocked !== undefined) {
            const update = await Category.findByIdAndUpdate({ _id: category_id }, { $set: { is_deleted: is_blocked } });
            const updated = await Product.updateMany({ category: category_id }, { $set: { is_deleted: is_blocked } });
            console.log(update.is_deleted);
            res.json({success: true})
            //res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadCategory,
    addCategory,
    deleteCategory,
    editCategory,
    updateCategory
} 